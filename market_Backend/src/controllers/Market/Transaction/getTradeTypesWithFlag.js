const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getTradeTypesWithFlag = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId } = req.body;

    if (!ulbId) {
      console.error("Validation Error: Missing required parameter in request body (ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter in request body: ulbId is mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_trade_id AS tradeId,
        var_trade_name AS tradeName,
        'N' AS flag
      FROM
        aomk_trade_mas
      WHERE
        var_trade_flag = 'Y'
        AND num_trade_ulbid = :ulbId
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching trade types with flag:", error);
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
        message: "Internal Server Error during fetching trade types with flag.",
        error: clientError,
      });
    }
  } 
};

module.exports = getTradeTypesWithFlag;
