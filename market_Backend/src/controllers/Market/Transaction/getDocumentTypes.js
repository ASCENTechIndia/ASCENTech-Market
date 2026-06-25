const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 


const getDocumentTypes = async (req, res) => {
  let connection;
  let result;

  try {
 
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        docid AS documentId,
        doctypename AS documentTypeName
      FROM
        view_document_mas
      ORDER BY
        doctypename -- Order by document type name for consistent results
    `;

    result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT, 
    });

    console.log(`Found ${result.rows.length} document types.`);

  
    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching document types:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching document types.",
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

module.exports = getDocumentTypes;
