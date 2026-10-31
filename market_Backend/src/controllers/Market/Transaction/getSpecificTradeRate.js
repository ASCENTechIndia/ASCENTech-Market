const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getSpecificTradeRate = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, tradeTypeId, tradeCategoryId } = req.body;

    if (!ulbId || !tradeTypeId || !tradeCategoryId) {
      console.error("Validation Error: Missing required parameters in request body (ulbId, tradeTypeId, tradeCategoryId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: ulbId, tradeTypeId, and tradeCategoryId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    const parsedTradeTypeId = parseInt(tradeTypeId, 10);
    const parsedTradeCategoryId = parseInt(tradeCategoryId, 10);

    if (isNaN(parsedUlbId) || isNaN(parsedTradeTypeId) || isNaN(parsedTradeCategoryId)) {
      console.error(`Validation Error: Invalid input. ulbId: ${ulbId}, tradeTypeId: ${tradeTypeId}, tradeCategoryId: ${tradeCategoryId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for ulbId, tradeTypeId, or tradeCategoryId. All must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        arm.num_rate_rate AS tradeRate
      FROM
        aomk_rate_mas arm
      INNER JOIN
        aomk_tradetype_mas atm ON atm.num_tradetype_id = arm.num_rate_tradetypeid
        AND atm.aomk_tradetype_ulbid = arm.num_rate_ulbid
      INNER JOIN
        aomk_tradecategory_mas atcm ON atcm.num_tradecategory_id = atm.aomk_tradetype_tradecategoryid
        AND atcm.num_tradecategory_ulbid = arm.num_rate_ulbid
      WHERE
        arm.num_rate_ulbid = :ulbId
        AND arm.num_rate_id = :tradeTypeId
        AND atcm.num_tradecategory_id = :tradeCategoryId
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      tradeTypeId: { val: parsedTradeTypeId, type: oracledb.NUMBER },
      tradeCategoryId: { val: parsedTradeCategoryId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(`No trade rate found for ULB ID: ${ulbId}, Trade Type ID: ${tradeTypeId}, Trade Category ID: ${tradeCategoryId}`);
      return res.status(404).json({
        success: false,
        message: "No trade rate found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Error fetching specific trade rate:", error);
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
        message: "Internal Server Error during fetching specific trade rate.",
        error: clientError,
      });
    }
  }
};

module.exports = getSpecificTradeRate;
