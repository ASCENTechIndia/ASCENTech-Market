const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getMarketLicenseDetailsByLicenseNo = async (req, res) => {
  let connection;
  let result;

  try {
    const { LicNo, OrgId } = req.body;

    if (!LicNo || !OrgId) {
      console.error("Validation Error: Missing required parameters in request body (LicNo, OrgId).");
      return res.status(400).json({ success: false, message: "LicNo and OrgId are mandatory." });
    }

    const trimmedLicNo = String(LicNo).trim();
    if (trimmedLicNo === '') {
      console.error(`Validation Error: Invalid LicNo: ${LicNo}. Expected a non-empty string.`);
      return res.status(400).json({ success: false, message: `Invalid format for LicNo: ${LicNo}. Expected a non-empty string.` });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(`Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for OrgId: ${OrgId}. Expected a number.` });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        mkt.num_mktlice_appliid AS appliid,
        mkt.var_mktlice_licenceno AS licenceno,
        apm.dat_appli_recdate AS amt_date,
        apm.num_appli_recamount AS amount,
        mkt.dat_mktlice_validfrom AS validfrom,
        mkt.dat_mktlice_validtilldt AS validtilldt
      FROM
        aomk_mktlice_mas mkt
      INNER JOIN
        aomk_appli_mas apm ON apm.num_appli_id = mkt.num_mktlice_appliid
      WHERE
        mkt.var_mktlice_licenceno = :LicNo
        AND mkt.num_mktlice_ulbid = :OrgId
      ORDER BY
        mkt.dat_mktlice_validfrom DESC -- Order by valid from date for consistent results
    `;

    const binds = {
      LicNo: { val: trimmedLicNo, type: oracledb.STRING },
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(`No market license details found for License No: ${LicNo}, Org ID: ${OrgId}`);
      return res.status(404).json({
        success: false,
        message: "No market license details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching market license details by license number:", error);
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
        message: "Internal Server Error during fetching market license details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getMarketLicenseDetailsByLicenseNo;
