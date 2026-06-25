const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getStandardItems = async (req, res) => {
  let connection;
  let result;

  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_sditems_id AS itemId,
        var_sditems_name AS item
      FROM
        aomk_sditems_mas
    `;

    result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT, 
    });

    res.status(200).json({
    data: result.rows
    });

  } catch (error) {
    console.error("Error fetching standard items:", error);
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
        message: "Internal Server Error during fetching standard items.",
        error: clientError,
      });
    }
  }
};

module.exports = getStandardItems;
