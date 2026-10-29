const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getApplicationTradeDetailsByAppId = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      console.error("Validation Error: Missing required parameter in request body (applicationId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter in request body: applicationId is mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);

    if (isNaN(parsedApplicationId)) {
      console.error(`Validation Error: Invalid input. applicationId: ${applicationId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId: ${applicationId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_applitrade_id AS num_applitrade_id,
        num_applitrade_appliid AS num_applitrade_appliid,
        num_applitrade_tradeid AS num_applitrade_tradeid
      FROM
        aomk_applitrade_det
      WHERE
        num_applitrade_appliid = :applicationId
    `;

    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, 
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching application trade details:", error);
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
        message: "Internal Server Error during fetching application trade details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getApplicationTradeDetailsByAppId;
