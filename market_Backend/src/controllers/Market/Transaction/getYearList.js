const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getYearList = async (req, res) => {
  let connection;
  let result;

  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_year_name AS yearName,
        num_year_id AS yearId
      FROM
        aomk_year_def
      ORDER BY
        num_year_name -- Optional: Order by year name for consistent results
    `;

    result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    // 4. Send the Results as JSON Response
    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching year definitions:", error);
    if (!res.headersSent) { 
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching year definitions.",
        error: error.message,
      });
    }
  } finally {
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

module.exports = getYearList;
