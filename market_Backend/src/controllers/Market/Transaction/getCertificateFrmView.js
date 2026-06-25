const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getCertificateFrmView = async (req, res) => {
  let connection;
 try {
    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (applicationId, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: applicationId and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. applicationId: ${applicationId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId: ${applicationId} or ulbId: ${ulbId}. Expected numbers.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT *
      FROM view_certificategenrpt
      WHERE appliid = :applicationId
        AND ulbid = :ulbId
    `;

    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return rows as JavaScript objects
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No certificate generation report found for Application ID: ${applicationId}, ULB ID: ${ulbId}.`,
        data: []
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    // 7. Centralized Error Handling
    console.error("Error fetching certificate generation report:", error);

    if (!res.headersSent) {
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.",
      };
      if (typeof error.code === 'string' || typeof error.code === 'number') {
        clientError.code = error.code;
      }
      if (typeof error.errorNum === 'number') {
        clientError.oracleErrorNum = error.errorNum;
      }

      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching certificate generation report.",
        error: clientError,
      });
    }
  } 
};

module.exports = getCertificateFrmView;