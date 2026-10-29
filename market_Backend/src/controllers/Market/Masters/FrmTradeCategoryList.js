const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmTradeCategoryList = async (req, res) => {
    let connection;
    try {
        const in_orgid = req.body.OrgId;

        // --- Validation ---
        if (!in_orgid || isNaN(in_orgid)) {
            return res.status(400).json({
                errorCode: -200, // Custom error code for missing/invalid OrgId
                message: 'Parameter OrgId is required in the request body and must be a valid number.'
            });
        }

        connection = await getConnection();

        // SQL query remains the same as it's purely a SELECT operation
        const sql = `
            SELECT
                num_tradecategory_id,
                var_tradecategory_name,
                CASE var_tradecategory_flag
                    WHEN 'Y' THEN 'Active'
                    WHEN 'N' THEN 'Inactive'
                    ELSE var_tradecategory_flag -- Handle other potential values gracefully
                END AS var_tradecategory_flag
            FROM
                aomk_TradeCategory_mas
            WHERE
                num_tradecategory_ulbid = :in_orgid
        `;

        const result = await connection.execute(
            sql,
            { in_orgid: parseInt(in_orgid, 10) }, // Ensure OrgId is bound as a number
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return results as array of objects
        );

        // If no rows found, return a specific message or empty array
        if (result.rows.length === 0) {
            return res.status(200).json({
                errorCode: 0, // Or a specific code for "no data found" if you prefer
                message: 'No trade categories found for the given Organization ID.',
                data: []
            });
        }

        // Send the fetched data
        res.status(200).json({
            errorCode: 9999, // Success code
            message: 'Trade categories fetched successfully.',
            data: result.rows
        });

    } catch (err) {
        console.error('Error fetching trade categories by POST:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeCategoriesByPost:', err);
            }
        }
    }
};

module.exports = FrmTradeCategoryList