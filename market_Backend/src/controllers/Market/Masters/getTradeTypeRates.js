const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getTradeTypeRates = async (req, res) => {
    let connection;
    try {
        const { orgId, tradeTypeId } = req.body; // Expecting orgId and tradeTypeId in the request body

        // Basic validation for inputs
        if (!orgId || isNaN(orgId)) {
            return res.status(400).json({ error: 'orgId is required and must be a number.' });
        }
        if (!tradeTypeId || isNaN(tradeTypeId)) {
            return res.status(400).json({ error: 'tradeTypeId is required and must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                rtm.num_rate_tradetypeid AS TradeTypeID,
                rtm.num_rate_tradetypename AS TradeType,
                TO_CHAR(rtm.dat_rate_fromdate, 'dd-MON-yyyy') AS DTFrom,
                TO_CHAR(rtm.dat_rate_todate, 'dd-MON-yyyy') AS DTto,
                rtm.num_rate_rate AS Rate
            FROM
                aomk_rate_mas rtm
            INNER JOIN
                aomk_tradetype_mas ttm
            ON
                ttm.num_tradetype_id = rtm.num_rate_tradetypeid
            WHERE
                ttm.aomk_tradetype_ulbid = :orgId_param
                AND ttm.num_tradetype_id = :tradeTypeId_param
            ORDER BY
                rtm.num_rate_id ASC
        `;

        const result = await connection.execute(
            sqlQuery,
            { orgId_param: orgId, tradeTypeId_param: tradeTypeId }, // Bind both parameters
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: `No rates found for Trade Type ID '${tradeTypeId}' in Organization ID '${orgId}'.`
            });
        }

        res.status(200).json({
            data: result.rows // Return the array of rate objects
        });

    } catch (err) {
        console.error('Error in getTradeTypeRates:', err);
        res.status(500).json({ error: 'Failed to fetch trade type rates', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeTypeRates:', err);
            }
        }
    }
};

module.exports =  getTradeTypeRates