const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getDistinctZones = async (req, res) => {
  let connection;
  let result;

  try {
    const { wardId, ulbId } = req.body;

    if (!wardId || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (wardId, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: wardId and ulbId are mandatory.",
      });
    }

    const parsedWardId = parseInt(wardId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedWardId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. wardId: ${wardId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for wardId or ulbId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT DISTINCT
        zonename AS zoneName,
        zoneid AS zoneId
      FROM
        prop.vw_zonemas
      WHERE
        wardid = :wardId
        AND ulbid = :ulbId
      ORDER BY
        zonename -- Order by zone name for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      wardId: { val: parsedWardId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching distinct zones:", error);
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
        message: "Internal Server Error during fetching distinct zones.",
        error: clientError,
      });
    }
  }
};

module.exports = getDistinctZones;
