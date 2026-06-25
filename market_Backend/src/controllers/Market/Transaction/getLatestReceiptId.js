const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getLatestReceiptId = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { applicationId } = req.body;

    // Validate mandatory applicationId
    if (!applicationId) {
      console.error("Validation Error: Missing required parameter in request body (applicationId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: applicationId is mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    if (isNaN(parsedApplicationId)) {
      console.error(`Validation Error: Invalid applicationId: ${applicationId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId: ${applicationId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT recipt_id FROM (
          SELECT num_recipt_id AS recipt_id
          FROM aomk_recipt_def
          WHERE num_recipt_appliid = :applicationId
          ORDER BY dat_recipt_insdate DESC
      ) WHERE ROWNUM = 1
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(`No receipt ID found for Application ID: ${applicationId}`);
      return res.status(404).json({
        success: false,
        message: "No latest receipt ID found for the provided application ID.",
      });
    }

    const latestReceipt = result.rows[0];

    res.status(200).json({
      data: latestReceipt
    });

  } catch (error) {
    console.error("Error fetching latest receipt ID:", error);
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
        message: "Internal Server Error during fetching latest receipt ID.",
        error: clientError,
      });
    }
  } 
};

module.exports = getLatestReceiptId;
