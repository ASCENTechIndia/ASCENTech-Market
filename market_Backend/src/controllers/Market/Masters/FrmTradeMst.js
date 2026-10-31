const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmTradeMst = async (req, res) => {
    let connection;
    try {
        const { trade_id, org_id } = req.body; 

        // Validate inputs
        if (!trade_id || !org_id) {
            return res.status(400).json({ error: 'Both trade_id and org_id are required in the request body.' });
        }
        if (isNaN(trade_id) || isNaN(org_id)) {
            return res.status(400).json({ error: 'Invalid trade_id or org_id provided. Must be numbers.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_trade_id AS tradeid,
                var_trade_name AS tradename,
                var_trade_flag AS tradeflag -- Returning 'Y' or 'N' directly as per your query
            FROM
                aomk_trade_mas
            WHERE
                num_trade_id = :trade_id_param
                AND num_trade_ulbid = :org_id_param
        `;

        const result = await connection.execute(
            sqlQuery,
            { trade_id_param: trade_id, org_id_param: org_id }, // Pass both as bind variables
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );


        // If no data is found, return 404
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No trade data found for Trade ID '${trade_id}' in Organization ID '${org_id}'.` });
        }

        // Return the first (and likely only) row found, or the whole array if multiple matches are expected
        res.status(200).json({
            data: result.rows[0] // Assuming trade_id is unique per org_id, return the first object
        });

    } catch (err) {
        console.error('Error in getSingleTradeData:', err);
        res.status(500).json({ error: 'Failed to fetch single trade data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getSingleTradeData:', err);
            }
        }
    }
};

module.exports = FrmTradeMst;