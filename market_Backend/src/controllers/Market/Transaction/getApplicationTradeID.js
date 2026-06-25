const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure

const getApplicationTradeID = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
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
        num_applitrade_id AS appliTradeId,
        num_applitrade_appliid AS appliId,
        num_applitrade_tradeid AS tradeId
      FROM
        aomk_applitrade_det
      WHERE
        num_applitrade_appliid = :applicationId
      ORDER BY
        num_applitrade_id -- Optional: Order by ID for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    // 6. Send the Results as JSON Response
    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching application trade details:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching application trade details.",
        error: error.message,
      });
    }
  } finally {
    // 7. Close the Database Connection
    if (connection) {
      try {
        await connection.close();
        console.log("Database connection closed.");
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
};

module.exports = getApplicationTradeID;
