const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getMarketLicenseBillingDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { licenseNo, ulbId } = req.body;

    if (!licenseNo) {
      console.error("Validation Error: Missing required parameter in request body (licenseNo).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: licenseNo is mandatory.",
      });
    }

    const trimmedLicenseNo = String(licenseNo).trim();
    if (trimmedLicenseNo === '') {
      console.error(`Validation Error: Invalid licenseNo: ${licenseNo}. Expected a non-empty string.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for licenseNo: ${licenseNo}. Expected a non-empty string.`,
      });
    }

    if (!ulbId) {
      console.error("Validation Error: Missing required parameter in request body (ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: ulbId is mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
          am.num_appli_id AS applicationId,
          mlm.num_mktlice_id AS marketLicenseId,
          mlm.var_mktlice_licenceno AS licenseNo,
          am.var_appli_placeownername AS ownerName,
          am.num_appli_contactno AS contactNo,
          am.num_appli_recamount AS receivedAmount,
          am.var_appli_recno AS receiptNumber,
          am.dat_appli_recdate AS receiptDate,
          am.var_appli_applino AS applicationNumber,
          ayd.num_year_id AS yearId,
          ayd.num_year_name AS yearName,
          NVL(am.num_appli_arreasamt, 0) AS arrears,
          NVL(abm.num_bill_current, 0) AS currentAmount,
          am.num_appli_ulbid AS ulbId,
          NVL(am.num_appli_arreasamt, 0) + NVL(abm.num_bill_current, 0) AS totalAmount
      FROM aomk_appli_mas am
      INNER JOIN aomk_mktlice_mas mlm
          ON mlm.num_mktlice_appliid = am.num_appli_id
          AND mlm.num_mktlice_ulbid = am.num_appli_ulbid
      INNER JOIN aomk_bill_mas abm
          ON abm.var_bill_licenceno = mlm.num_mktlice_id
          AND abm.num_bill_ulbid = am.num_appli_ulbid
      LEFT JOIN aomk_year_def ayd
          ON ayd.num_year_name = abm.var_bill_fyear
      WHERE mlm.var_mktlice_licenceno = :licenseNo
          AND am.num_appli_ulbid = :ulbId
          AND am.var_appli_recno IS NULL
          AND am.dat_appli_recdate IS NULL
      ORDER BY am.num_appli_id DESC -- Added for consistent results
    `;

    const binds = {
      licenseNo: { val: trimmedLicenseNo, type: oracledb.STRING },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(`No market license billing details found for License No: ${licenseNo}, ULB ID: ${ulbId}`);
      return res.status(404).json({
        success: false,
        message: "No market license billing details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching market license billing details:", error);
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
        message: "Internal Server Error during fetching market license billing details.",
        error: clientError,
      });
    }
  }
};

module.exports = getMarketLicenseBillingDetails;
