const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getTradeTypesByCategory = async (req, res) => {
  let connection;
  let result;

  try {
    const { tradeCategoryId, ulbId } = req.body;

    if (!tradeCategoryId || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (tradeCategoryId, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: tradeCategoryId and ulbId are mandatory.",
      });
    }

    const parsedTradeCategoryId = parseInt(tradeCategoryId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedTradeCategoryId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. tradeCategoryId: ${tradeCategoryId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for tradeCategoryId or ulbId. Both must be numbers.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        arm.num_rate_tradetypename, -- Assuming this column exists in aomk_rate_mas based on user's query
        arm.num_rate_id AS tradeTypeId
      FROM
        aomk_rate_mas arm
      INNER JOIN
        aomk_tradetype_mas atm ON atm.num_tradetype_id = arm.num_rate_tradetypeid AND atm.aomk_tradetype_ulbid = arm.num_rate_ulbid
      WHERE
        atm.var_tradetype_flag = 'Y'
        AND atm.aomk_tradetype_tradecategoryid = :tradeCategoryId
        AND arm.num_rate_ulbid = :ulbId
      ORDER BY
        arm.num_rate_tradetypename -- Order by name for consistent results
    `;

    const binds = {
      tradeCategoryId: { val: parsedTradeCategoryId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching trade types by category:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
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
        message: "Internal Server Error during fetching trade types by category.",
        error: clientError,
      });
    }
  } 
};

module.exports = getTradeTypesByCategory;
