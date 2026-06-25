const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getCollectionDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { licenseId, receiptId } = req.body;

    if (!licenseId) {
      console.error("Validation Error: Missing required parameter in request body (licenseId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: licenseId is mandatory.",
      });
    }

    if (!receiptId) {
      console.error("Validation Error: Missing required parameter in request body (receiptId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: receiptId is mandatory.",
      });
    }

    const trimmedLicenseId = String(licenseId).trim();
    const trimmedReceiptId = String(receiptId).trim();

    if (trimmedLicenseId === '' || trimmedReceiptId === '') {
      console.error(`Validation Error: licenseId or receiptId cannot be empty strings. licenseId: '${licenseId}', receiptId: '${receiptId}'`);
      return res.status(400).json({
        success: false,
        message: "licenseId and receiptId cannot be empty.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
          num_colldtls_id AS id,
          num_colldtls_licence AS licence,
          num_colldtls_yearid AS yearId,
          var_colldtls_year AS yearName,
          num_colldtls_current AS currentAmt,
          num_colldtls_paidamt AS amount
      FROM aomk_colldtls_mas
      WHERE num_colldtls_licence = :licenseId
        AND num_colldtls_recid = :receiptId
      ORDER BY num_colldtls_id ASC -- Adding an ORDER BY for consistent results if multiple rows match (though not expected for ID)
    `;

    // 4. Define Bind Parameters
    const binds = {
      licenseId: { val: trimmedLicenseId, type: oracledb.STRING }, // Assuming these are string identifiers
      receiptId: { val: trimmedReceiptId, type: oracledb.STRING },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(`No collection details found for License ID: ${licenseId}, Receipt ID: ${receiptId}`);
      return res.status(404).json({
        success: false,
        message: "No collection details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching collection details:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
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
        message: "Internal Server Error during fetching collection details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getCollectionDetails;
