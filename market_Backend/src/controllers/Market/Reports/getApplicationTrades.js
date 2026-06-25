const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getApplicationTrades = async (req, res) => {
  let connection;
  let result;

  try {
    const { appId } = req.body;

    if (!appId) {
      console.error("Validation Error: Missing required parameter in request body (appId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: appId is mandatory.",
      });
    }

    const parsedAppId = parseInt(appId, 10);

    if (isNaN(parsedAppId)) {
      console.error(`Validation Error: Invalid input. appId: ${appId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for appId. Expected a number.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        atm.var_trade_name AS TradeName,
        aad.num_applitrade_tradeid AS tradeId
      FROM
        aomk_applitrade_det aad
      INNER JOIN
        aomk_trade_mas atm ON aad.num_applitrade_tradeid = atm.num_trade_id
      WHERE
        aad.num_applitrade_appliid = :appId
      ORDER BY
        atm.var_trade_name -- Order by trade name for consistent results
    `;


    const binds = {
      appId: { val: parsedAppId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching application trades:", error);
    if (!res.headersSent) {
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        clientError.code = error.code;
      }
      if (error.errorNum) {
        clientError.oracleErrorNum = error.errorNum;
      }
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching application trades.",
        error: clientError,
      });
    }
  } 
};

module.exports = getApplicationTrades;
