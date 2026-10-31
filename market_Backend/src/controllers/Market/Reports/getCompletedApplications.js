const oracledb = require('oracledb');
const { getConnection } = require('../../../config/database'); 
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; 

const FILE_UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "generated_files");


function detectFileTypeFromBuffer(buffer) {
    if (!buffer || buffer.length < 4) { 
        return '.bin';
    }
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
        return '.pdf';
    }
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        if (buffer[3] === 0xE0 || buffer[3] === 0xE1 || buffer[3] === 0xE2 || buffer[3] === 0xE3 || buffer[3] === 0xE8 || buffer[3] === 0xDB || buffer[3] === 0xEE) {
            return '.jpg';
        }
        return '.jpg'; 
    }
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return '.png';
    }
    console.warn('Could not determine file type from magic number for digicert. Defaulting to .bin');
    return '.bin';
}


// Renaming the function slightly to reflect it's now a POST handler
const getCompletedApplications = async (req, res) => {
    let connection;

    try {
        // --- CHANGE: Get orgId from req.body instead of req.query ---
        const { orgId } = req.body; 

        // Input validation
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
                zonename,
                wardname,
                num_appli_id AS applicationid,
                var_appli_applino AS applicationno,
                var_appli_applidt AS applicationdate,
                var_appli_shopname AS shopname,
                num_appli_busstartyr AS Businessyear,
                var_appli_panno AS panno,
                num_appli_contactno AS contactno,
                var_appli_email AS email,
                var_appli_address AS address,
                var_appli_oldlicencno AS oldlicenseno,
                blob_digicert_digicert AS digicert_blob
            FROM
                aomk_appli_mas
            INNER JOIN
                prop.vw_zonemas ON zoneid = num_appli_zoneid AND wardid = num_appli_wardid
            INNER JOIN
                market.aomk_digicert_det ON num_digicert_uniqueno = num_appli_id
            WHERE
                var_appli_appstatus = 'C'
                AND num_appli_ulbid = :orgId
                AND blob_digicert_digicert IS NOT NULL
            ORDER BY
                var_appli_applidt DESC
        `;

        const binds = {
            orgId: orgId
        };

        const result = await connection.execute(sqlQuery, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            fetchInfo: {
                DIGICERT_BLOB: { type: oracledb.BUFFER },
            },
        });

        const processedRows = await Promise.all(result.rows.map(async (row) => {
            const newRow = { ...row };
            let digicertUrl = null;

            if (newRow.DIGICERT_BLOB instanceof Buffer && newRow.DIGICERT_BLOB.length > 0) {
                const digicertExtension = detectFileTypeFromBuffer(newRow.DIGICERT_BLOB);
                const filename = `digicert_${newRow.APPLICATIONID}_${uuidv4()}${digicertExtension}`; 
                const filepath = path.join(FILE_UPLOAD_DIR, filename);
                try {
                    await fs.writeFile(filepath, newRow.DIGICERT_BLOB);
                    console.log(`Successfully wrote digicert file to: ${filepath} with extension: ${digicertExtension}`);
                    digicertUrl = `/generated_files/${filename}`;
                } catch (err) {
                    console.error(`Failed to write digicert file ${filename} to ${filepath}:`, err);
                    digicertUrl = null;
                }
            } else {
                console.log(`No digicert BLOB found or BLOB is empty for application ID: ${newRow.APPLICATIONID}`);
                digicertUrl = null;
            }

            newRow.digicert_url = digicertUrl;
            delete newRow.DIGICERT_BLOB;

            return newRow;
        }));

        if (processedRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No approved applications with digital certificates found for the provided Organization ID.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Approved applications with digital certificates fetched successfully.',
            data: processedRows,
        });

    } catch (error) {
        console.error('API Error in getCompletedApplications:', error);
        if (connection) {
            try {
                await connection.rollback(); 
            } catch (rollbackError) {
                console.error('Error during rollback in getCompletedApplications:', rollbackError);
            }
        }
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Internal server error while fetching approved applications.',
                details: 'An unexpected internal server error occurred. Please try again later.'
            });
        }
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

module.exports = getCompletedApplications 