const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmTradeList = async (req, res) => {
    let connection;
    try {
        const { org_id } = req.body; 

       
        if (!org_id) {
            return res.status(400).json({ error: 'org_id is required in the request body.' });
        }
        if (isNaN(org_id)) {
            return res.status(400).json({ error: 'Invalid org_id provided. Must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_trade_id AS tradeid,
                var_trade_name AS tradename,
                CASE var_trade_flag
                    WHEN 'Y' THEN 'Active'
                    WHEN 'N' THEN 'Inactive'
                END AS tradeflag
            FROM
                aomk_trade_mas
            WHERE
                num_trade_ulbid = :org_id_param
            ORDER BY
                var_trade_name ASC -- Added an order by for consistent results
        `;


        const result = await connection.execute(
            sqlQuery,
            { org_id_param: org_id }, // Pass org_id as a bind variable
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );


        res.status(200).json({
            data: result.rows // Return the array of objects with column names
        });

    } catch (err) {
        console.error('Error in getTradeDataByOrgId:', err);
        res.status(500).json({ error: 'Failed to fetch trade data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeDataByOrgId:', err);
            }
        }
    }
};

module.exports = FrmTradeList