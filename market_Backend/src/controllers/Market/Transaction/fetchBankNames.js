const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const fetchBankNames = async (req, res) => {
    let connection;
    try {
        const ulbId = req.body.ulbId; 

        if (ulbId === undefined || ulbId === null) { // Check for undefined/null explicitly
            console.error("[Controller] Validation Error: Missing 'ulbId' in request body.");
            return res.status(400).json({
                success: false,
                message: "Missing 'ulbId' in request body. It is mandatory."
            });
        }

        const parsedUlbId = parseInt(ulbId, 10);
        if (isNaN(parsedUlbId)) {
            console.error(`[Controller] Validation Error: Invalid 'ulbId' format: '${ulbId}'. Expected a number.`);
            return res.status(400).json({
                success: false,
                message: "Invalid 'ulbId' format. Expected a number."
            });
        }

        connection = await getConnection(); 

        const sqlQuery = `
            SELECT
                bank_id,
                bank_name
            FROM
                prop.vw_bankconfig
            WHERE
                ulbid = :ulbId
        `;

        const binds = {
            ulbId: parsedUlbId // Bind the parsed numeric ULB ID
        };

        const options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT // Ensure results are objects
        };

        const result = await connection.execute(sqlQuery, binds, options);

        if (result.rows.length === 0) {
            console.log(`[Controller] No bank configuration found for ulbId: ${parsedUlbId}.`);
            return res.status(404).json({
                success: true, // Still true, but no data
                message: `No bank configuration found for ulbId: ${parsedUlbId}.`,
                data: []
            });
        }

        res.status(200).json({
            data: result.rows
        });

    } catch (error) {
        console.error("[Controller] Error fetching bank configuration:", error);
        if (!res.headersSent) {
            const clientError = {
                message: error.message || "An unexpected internal server error occurred."
            };
            if (error.code) clientError.code = error.code; // Oracle error code
            if (error.errorNum) clientError.oracleErrorNum = error.errorNum; // Oracle error number

            res.status(500).json({
                success: false,
                message: "Internal Server Error fetching bank configuration.",
                error: clientError
            });
        }
    } 
};

module.exports = fetchBankNames
