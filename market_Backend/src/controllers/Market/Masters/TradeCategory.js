const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const TradeCategory = async (req, res) => {
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
                var_TradeCategory_name AS tradeCategoryName,
                num_TradeCategory_id AS tradeCategoryId
            FROM
                aomk_TradeCategory_mas
            WHERE
                num_TradeCategory_ulbid = :org_id_param
                AND var_TradeCategory_flag = 'Y'
        `;

        const result = await connection.execute(
            sqlQuery,
            { org_id_param: org_id },
            { outFormat: oracledb.OUT_FORMAT_OBJECT } 
        );

        res.status(200).json({
            data: result.rows 
        });

    } catch (err) {
        console.error('Error in getActiveTradeCategoriesByOrgId:', err);
        res.status(500).json({ error: 'Failed to fetch active trade categories', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getActiveTradeCategoriesByOrgId:', err);
            }
        }
    }
};

module.exports = TradeCategory