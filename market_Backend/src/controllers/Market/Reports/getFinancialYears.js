const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getFinancialYears = async (req, res) => {
  let connection;
  let result;

  try {

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_financialyear_name AS financialYearName,
        num_financialyear_id AS financialYearId
      FROM
        aomk_financialyear_def
      ORDER BY
        num_financialyear_id -- Order by financial year ID as per your query
    `;

    result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });


    // 4. Send the Results as JSON Response
    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching financial year definitions:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        clientError.code = error.code;
      }
      if (clientError.errorNum) { // Changed to clientError.errorNum
        clientError.oracleErrorNum = clientError.errorNum;
      }
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching financial year definitions.",
        error: clientError,
      });
    }
  }
};

module.exports = getFinancialYears;
