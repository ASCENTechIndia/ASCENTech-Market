const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getArrearsDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { marketLicenseId, ulbId } = req.body;

    if (!marketLicenseId || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (marketLicenseId, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters in request body: marketLicenseId and ulbId are mandatory.",
      });
    }

    const parsedMarketLicenseId = parseInt(marketLicenseId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedMarketLicenseId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. marketLicenseId: ${marketLicenseId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for marketLicenseId or ulbId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_arrears_yearid AS arrearsYearId,
        num_arrears_arrears AS arrearsAmount,
        num_arrears_current AS currentAmount
      FROM
        aomk_arrears_det
      WHERE
        num_arrears_licenceid = :marketLicenseId
        AND num_arrears_ulbid = :ulbId
      ORDER BY
        num_arrears_yearid -- Optional: Order by year for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      marketLicenseId: { val: parsedMarketLicenseId, type: oracledb.NUMBER },
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
    console.error("Error fetching arrears details:", error);
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
        message: "Internal Server Error during fetching arrears details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getArrearsDetails;
