const oracledb = require('oracledb');
const { getConnection } = require('../../../config/database');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const FILE_UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "generated_files");

function detectFileTypeFromBuffer(buffer) {
    if (!buffer || buffer.length < 4) return '.bin';
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return '.pdf';
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return '.jpg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return '.png';
    return '.bin';
}

const getFilterCompletedApplications = async (req, res) => {
    let connection;

    try {
        const { orgId, licenceno, applicationno, shopname, billno } = req.body;

        if (!orgId) {
            return res.status(400).json({
                success: false,
                message: 'Organization ID (orgId) is required in the request body.'
            });
        }

        await fs.mkdir(FILE_UPLOAD_DIR, { recursive: true });

        connection = await getConnection();

        const sqlQuery = `
           SELECT 
                z.zonename AS zonename,
                z.wardname AS wardname,
                a.num_appli_id AS applicationid,
                a.var_appli_applino AS applicationno,
                a.var_appli_applidt AS applicationdate,
                a.var_appli_shopname AS shopname,
                a.num_appli_busstartyr AS businessyear,
                a.var_appli_panno AS panno,
                a.num_appli_contactno AS contactno,
                a.var_appli_email AS email,
                a.var_appli_address AS address,
                a.var_appli_oldlicencno AS licenceno,
                d.blob_digicert_digicert AS digicert,
                b.var_bill_billno AS billno
            FROM 
                aomk_appli_mas a
            INNER JOIN 
                prop.vw_zonemas z 
                    ON z.zoneid = a.num_appli_zoneid 
                   AND z.wardid = a.num_appli_wardid
            INNER JOIN 
                market.aomk_digicert_det d 
                    ON d.num_digicert_uniqueno = a.num_appli_id
            LEFT JOIN 
                market.aomk_bill_mas b 
                    ON b.var_bill_licenceno = a.var_appli_oldlicencno 
                   AND b.num_bill_ulbid = a.num_appli_ulbid
            WHERE 
                a.var_appli_appstatus = 'C'
                AND a.num_appli_ulbid = :p_orgid
                AND d.blob_digicert_digicert IS NOT NULL
                AND (:p_licenceno IS NULL OR a.var_appli_oldlicencno = :p_licenceno)
                AND (:p_applicationno IS NULL OR a.var_appli_applino = :p_applicationno)
                AND (:p_shopname IS NULL OR a.var_appli_shopname LIKE '%' || :p_shopname || '%')
                AND (:p_billno IS NULL OR b.var_bill_billno = :p_billno)
            ORDER BY 
                a.var_appli_applidt DESC
        `;

        const binds = {
            p_orgid: orgId,
            p_licenceno: licenceno === "null" ? null : licenceno,
            p_applicationno: applicationno === "null" ? null : applicationno,
            p_shopname: shopname === "null" ? null : shopname,
            p_billno: billno === "null" ? null : billno
        };

        const result = await connection.execute(sqlQuery, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchInfo: {
                DIGICERT: { type: oracledb.BUFFER },
            },
        });

        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row };
            let digicertUrl = null;

            if (newRow.DIGICERT instanceof Buffer && newRow.DIGICERT.length > 0) {
                const digicertExtension = detectFileTypeFromBuffer(newRow.DIGICERT);
                const filename = `digicert_${newRow.APPLICATIONID}_${uuidv4()}${digicertExtension}`;
                const filepath = path.join(FILE_UPLOAD_DIR, filename);

                try {
                    await fs.writeFile(filepath, newRow.DIGICERT);
                    digicertUrl = `/generated_files/${filename}`;
                } catch (err) {
                    console.error(`Failed to write digicert file ${filename}:`, err);
                    digicertUrl = null;
                }
            }

            newRow.digicert_url = digicertUrl;
            delete newRow.DIGICERT;
            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No matching records found for the provided filters.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Filtered applications with digital certificates fetched successfully.',
            data: processedRows,
        });

    } catch (error) {
        console.error('API Error in getCompletedApplications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching completed applications.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getCompletedApplications:', err);
            }
        }
    }
};

module.exports = getFilterCompletedApplications;
