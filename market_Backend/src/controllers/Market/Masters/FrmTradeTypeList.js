const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmTradeTypeList = async (req, res) => {
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
                num_tradetype_id AS tradetypeid,
                var_tradetype_name AS tradetypename,
                CASE var_tradetype_flag
                    WHEN 'Y' THEN 'Active'
                    WHEN 'N' THEN 'Inactive'
                END AS tradetypeflag
            FROM
                aomk_TradeType_mas
            WHERE
                aomk_TradeType_ULBID = :org_id_param
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
        console.error('Error in getTradeTypeDataByOrgId:', err);
        res.status(500).json({ error: 'Failed to fetch trade type data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeTypeDataByOrgId:', err);
            }
        }
    }
};

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

module.exports = {FrmTradeTypeList, TradeCategory,BindTradeTypeDetails, getTradeTypeRates}