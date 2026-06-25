const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getUserDigiCertKey = async (req, res) => {
  let connection;

  try {
    const { userId } = req.body;

    if (!userId) {
      console.error("Validation Error: Missing required parameter in request body (userId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: userId is mandatory.",
      });
    }

    const parsedUserId = userId;

    connection = await getConnection();

    // 3. Define the SQL Query
    const sqlQuery = `
      SELECT
        num_user_userid AS userId,
        var_user_digicertkey AS digiCertKey
      FROM
        admins.aoma_user_def
      WHERE
        num_user_userid = :userId
    `;

    const binds = {
      userId: { val: parsedUserId, type: oracledb.STRING }, // Assuming it's a string, use oracledb.NUMBER if it's a number
    };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return rows as JavaScript objects
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No digital certificate key found for UserId: ${userId}.`,
        data: []
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    // 7. Centralized Error Handling
    console.error("Error fetching user digital certificate key:", error);

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
        message: "Internal Server Error during fetching user digital certificate key.",
        error: clientError,
      });
    }
  }
};

module.exports = getUserDigiCertKey;