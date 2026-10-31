const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getLicenseTypes = async (req, res) => {
  let connection;
  let result;

  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        var_licensetype_name AS licenseTypeName,
        num_licensetype_id AS licenseTypeId
      FROM
        aomk_licensetype_mas
    `;


    result = await connection.execute(sqlQuery, [], { 
      outFormat: oracledb.OUT_FORMAT_OBJECT, 
    });

    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching license types:", error);
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching license types.",
        error: error.message,
      });
    }
  } finally {
    // 5. Close the Database Connection
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

module.exports = getLicenseTypes;
