const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getDistinctWardIds = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId, zoneId } = req.body;

    if (!ulbId || !zoneId) {
      console.error("Validation Error: Missing required parameters in request body (ulbId, zoneId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters in request body: ulbId and zoneId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    const parsedZoneId = parseInt(zoneId, 10);

    if (isNaN(parsedUlbId) || isNaN(parsedZoneId)) {
      console.error(`Validation Error: Invalid input. ulbId: ${ulbId}, zoneId: ${zoneId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for ulbId or zoneId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT DISTINCT
        wardid AS wardid
      FROM
        prop.vw_zonemas
      WHERE
        ulbid = :ulbId
        AND zoneid = :zoneId
      ORDER BY
        wardid
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      zoneId: { val: parsedZoneId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });


    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching distinct ward IDs:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching distinct ward IDs.",
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

module.exports = getDistinctWardIds;
