const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getDistinctWardNamesAndId  = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId } = req.body;

    if (!ulbId) {
      console.error("Validation Error: Missing required parameter in request body (ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter in request body: ulbId is mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    // 2. Get Database Connection
    connection = await getConnection();

    const sqlQuery = `
      SELECT DISTINCT
        wardname AS wardName,
        wardid AS wardId
      FROM
        prop.vw_zonemas
      WHERE
        ulbid = :ulbId
      ORDER BY
        wardname -- Order by ward name for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching distinct ward names and IDs:", error);
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
        message: "Internal Server Error during fetching distinct ward names and IDs.",
        error: clientError,
      });
    }
  } 
};

module.exports = getDistinctWardNamesAndId;
