const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const BindTradeTypeDetails = async (req, res) => {
    let connection;
    try {
        const { tradeTypeId, orgId } = req.body;

       
        if (!tradeTypeId || isNaN(tradeTypeId)) {
            return res.status(400).json({ error: 'tradeTypeId is required and must be a number.' });
        }
        if (!orgId || isNaN(orgId)) {
            return res.status(400).json({ error: 'orgId is required and must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_tradetype_id AS tradeTypeId,
                var_tradetype_name AS tradeTypeName,
                var_tradetype_flag AS tradeTypeFlag,
                aomk_tradetype_tradecategoryid AS tradeCategoryId
            FROM
                aomk_TradeType_mas
            WHERE
                num_tradetype_id = :tradeTypeId_param
                AND aomk_TradeType_ULBID = :orgId_param
        `;

        console.log(`Executing query for TradeType ID: ${tradeTypeId}, Org ID: ${orgId}`);

        const result = await connection.execute(
            sqlQuery,
            { tradeTypeId_param: tradeTypeId, orgId_param: orgId }, 
            { outFormat: oracledb.OUT_FORMAT_OBJECT } 
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No trade type data found for TradeType ID '${tradeTypeId}' in Organization ID '${orgId}'.` });
        }

        res.status(200).json({
            message: `Trade type data for TradeType ID '${tradeTypeId}' in Organization ID '${orgId}' fetched successfully`,
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Error in BindTradeTypeDetails:', err);
        res.status(500).json({ error: 'Failed to fetch single trade type data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in BindTradeTypeDetails:', err);
            }
        }
    }
};

module.exports = BindTradeTypeDetails