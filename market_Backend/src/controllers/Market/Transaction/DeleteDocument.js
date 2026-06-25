const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const DeleteDocument = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId } = req.body; 

    if (!applicationId) {
      console.error("Validation Error: Missing required parameter in request body (applicationId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: applicationId is mandatory.",
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
      DELETE FROM aomk_applidoc_det
      WHERE num_applidoc_appliid = :applicationId
    `;

    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, { autoCommit: true });

    const rowsAffected = result.rowsAffected || 0;

    if (rowsAffected > 0) {
      res.status(200).json({
        success: true,
        message: `${rowsAffected} document(s) deleted successfully for Application ID: ${applicationId}.`,
        rowsAffected: rowsAffected,
      });
    } else {
      res.status(404).json({
        success: false,
        message: `No documents found or deleted for Application ID: ${applicationId}.`,
        rowsAffected: 0,
      });
    }

  } catch (error) {
    console.error("Error deleting application documents:", error);
    // Rollback is usually not needed for a single auto-committed DELETE, but good for defensive coding.
    if (connection) {
      try {
        await connection.rollback(); // Attempt rollback on error if autoCommit was false (or in nested operations)
        console.log("Transaction rolled back due to error (if applicable).");
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
        message: "Internal Server Error during deleting application documents.",
        error: clientError,
      });
    }
  } 
};

module.exports = DeleteDocument;
