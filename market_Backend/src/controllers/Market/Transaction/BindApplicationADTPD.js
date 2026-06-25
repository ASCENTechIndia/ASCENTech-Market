const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure

/**
 * API endpoint to retrieve application details from aomk_appli_mas
 * for applications with a specific status ('V' - Verified) and other criteria,
 * filtered by ULB ID and a subquery for Ward IDs configured for the given user.
 * This API expects parameters in the request body via a POST request.
 *
 * @param {object} req - The Express request object, containing parameters in req.body.
 * @param {object} res - The Express response object, used to send the JSON data.
 *
 * Request Body Parameters (JSON):
 * {
 * "ulbId": "101", // Mandatory. The Urban Local Body ID. Expected to be a number.
 * "userId": "someuser" // Mandatory. The User ID for filtering ward configurations. Expected to be a string.
 * }
 */
const getVerifiedApplicationsAPI = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId, userId } = req.body;

    // Validate mandatory ULB ID
    if (!ulbId) {
      console.error("Validation Error: Missing required parameter: ulbId.");
      return res.status(400).json({ success: false, message: "ULB ID is mandatory." });
    }
    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for ulbId: ${ulbId}. Expected a number.` });
    }

    // Validate mandatory User ID
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error("Validation Error: Missing or invalid userId.");
      return res.status(400).json({ success: false, message: "User ID is mandatory and must be a non-empty string." });
    }
    const trimmedUserId = userId.trim();


    // 2. Get Database Connection
    connection = await getConnection();
    console.log("Database connection established for getVerifiedApplicationsAPI query.");

    // 3. Define the SQL Query
    // IMPORTANT: The SQL query is exactly as provided by the user,
    // with bind variables used for parameterized inputs instead of string concatenation.
    const sqlQuery = `
      SELECT
        apm.num_appli_id AS applicationid,
        apm.var_appli_applino AS applicationno,
        apm.var_appli_placeownername AS appliname,
        apm.var_appli_address AS address,
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        apm.var_appli_shopname AS shopname,
        apm.var_appli_applidt AS applicationdate
      FROM
        aomk_appli_mas apm
      INNER JOIN
        prop.vw_zonemas zm ON zm.zoneid = apm.num_appli_zoneid AND zm.wardid = apm.num_appli_wardid
      WHERE
        1=1
        AND apm.var_appli_appstatus = 'V'
        AND apm.num_appli_ulbid = :ulbId
        AND apm.var_appli_adtpstatus IS NULL OR apm.var_appli_adtpstatus = 'ADTPH' AND apm.var_appli_sdstatus IS NULL AND apm.var_appli_papernotice IS NULL AND apm.var_appli_type = 'N'
        AND apm.num_appli_wardid IN (
          SELECT num_warduser_wardid FROM aomk_warduser_config
          WHERE num_warduser_userid = :userId AND num_warduser_ulbid = :ulbIdSubquery
        )
      ORDER BY
        apm.num_appli_id DESC
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      userId: { val: trimmedUserId, type: oracledb.STRING },
      ulbIdSubquery: { val: parsedUlbId, type: oracledb.NUMBER } // Same value, but distinct bind name for clarity in subquery
    };

    console.log('Executing SQL Query with binds:', binds);

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    console.log(`Found ${result.rows.length} verified applications for ULB ID: ${ulbId}, User ID: ${userId}`);

    // 6. Send the Results as JSON Response
    res.status(200).json({
       data: result.rows
    });

  } catch (error) {
    console.error("Error fetching verified applications:", error);
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
        message: "Internal Server Error during fetching verified applications.",
        error: clientError,
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

module.exports = getVerifiedApplicationsAPI;