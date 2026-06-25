const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getAdditionalItems = async (req, res) => {
  let connection;
  let result;

  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_adtpitems_id AS itemId,
        var_adtpitems_name AS item
      FROM
        aomk_adtpitems_mas
    `;

    // 3. Execute the Query
    // Pass an empty array for binds as there are no WHERE clause parameters
    result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching additional items:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
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
        message: "Internal Server Error during fetching additional items.",
        error: clientError,
      });
    }
  } 
};

module.exports = getAdditionalItems;