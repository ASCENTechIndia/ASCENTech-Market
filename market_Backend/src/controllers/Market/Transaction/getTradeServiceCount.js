const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getTradeServiceCount = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { serviceName, licenseNo } = req.body;

    if (!serviceName || !licenseNo) {
      console.error("Validation Error: Missing required parameters in request body (serviceName, licenseNo).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: serviceName and licenseNo are mandatory.",
      });
    }

    // Basic validation for string types; can be expanded if specific formats are needed.
    if (typeof serviceName !== 'string' || serviceName.trim() === '') {
      console.error(`Validation Error: Invalid serviceName: ${serviceName}. Expected a non-empty string.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for serviceName. Expected a non-empty string.",
      });
    }
    if (typeof licenseNo !== 'string' || licenseNo.trim() === '') {
      console.error(`Validation Error: Invalid licenseNo: ${licenseNo}. Expected a non-empty string.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for licenseNo. Expected a non-empty string.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        COUNT(num_trade_id) AS id -- Renamed to 'count' for clarity in JS, or 'id' as per your query
      FROM
        aomk_tradeservice_mas
      WHERE
        var_trade_servicename = :serviceName
        AND var_trade_licenseno = :licenseNo
      ORDER BY
        date_trade_insdate DESC -- This ORDER BY might be ignored by Oracle for COUNT, but kept as in original query
    `;

    // 4. Define Bind Parameters
    const binds = {
      serviceName: { val: serviceName.trim(), type: oracledb.STRING },
      licenseNo: { val: licenseNo.trim(), type: oracledb.STRING },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    // The count will be in the first row, under the alias 'ID'
    const count = result.rows.length > 0 ? result.rows[0].ID : 0;

    // 6. Send the Results as JSON Response
    res.status(200).json({
      data: { count: count }
    });

  } catch (error) {
    console.error("Error fetching trade service count:", error);
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
        message: "Internal Server Error during fetching trade service count.",
        error: clientError,
      });
    }
  }
};

module.exports = getTradeServiceCount;
