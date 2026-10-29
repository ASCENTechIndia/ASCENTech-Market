const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmServiceMapList = async (req, res) => {
    let connection;

    try {
        const { ulbid } = req.body;

        // Validation
        if (!ulbid || isNaN(ulbid)) {
            return res.status(400).json({
                errorCode: -300,
                message: "Parameter 'ulbid' is required in the request body and must be a valid number."
            });
        }

        connection = await getConnection();

        const sql = `
            SELECT 
                num_serviceaccmap_id,
                var_serv_name,
                num_serviceaccmap_ulbid,
                num_serviceaccmapp_servid,
                var_serviceaccmap_glcode,
                var_serviceaccmap_accno
            FROM 
                aomk_serviceAccmap_det
            INNER JOIN 
                aomk_service_mas 
            ON 
                num_serv_id = num_serviceaccmapp_servid
            WHERE 
                num_serviceaccmap_ulbid = :ulbid
        `;

        const result = await connection.execute(
            sql,
            { ulbid: parseInt(ulbid, 10) },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return res.status(200).json({
                errorCode: 0,
                message: "No service account mappings found for the given ulbid.",
                data: []
            });
        }

        res.status(200).json({
            errorCode: 9999,
            message: "Service account mappings fetched successfully.",
            data: result.rows
        });

    } catch (err) {
        console.error("Error in FrmServiceMapList:", err);

        res.status(500).json({
            errorCode: -110,
            message: "Failed to retrieve service account mappings.",
            details: err.message || JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection in FrmServiceMapList:", err);
            }
        }
    }
};

module.exports = FrmServiceMapList;
