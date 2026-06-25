const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getMarketLicenseApplicationDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { OrgId, LicenseNo, BillNo, ShopName } = req.body;

    if (!OrgId) {
      console.error("Validation Error: Missing required parameter in request body (OrgId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: OrgId is mandatory.",
      });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(`Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for OrgId: ${OrgId}. Expected a number.`,
      });
    }

    // Trim optional string parameters, setting to null if empty
    const trimmedLicenseNo = LicenseNo ? String(LicenseNo).trim() : null;
    const trimmedBillNo = BillNo ? String(BillNo).trim() : null;
    const trimmedShopName = ShopName ? String(ShopName).trim() : null;

    connection = await getConnection();

    const sqlQuery = `
      SELECT
          pvw.wardname AS wardname,
          aam.num_appli_id AS applicationid,
          abm.var_bill_billno AS billno,
          amm.var_mktlice_licenceno AS licNo,
          aam.var_appli_applino AS applicationno,
          aam.var_appli_applidt AS applicationdate,
          aam.var_appli_shopname AS shopname,
          aam.num_appli_busstartyr AS Businessyear,
          aam.var_appli_panno AS panno,
          aam.num_appli_contactno AS contactno,
          aam.var_appli_email AS email,
          aam.var_appli_address AS address
      FROM
          aomk_appli_mas aam
      INNER JOIN
          aomk_mktlice_mas amm ON amm.num_mktlice_appliid = aam.num_appli_id
      INNER JOIN
          prop.vw_ward_mas pvw ON pvw.wardid = aam.num_appli_wardid AND pvw.ulbid = aam.num_appli_ulbid
      INNER JOIN
          aomk_bill_mas abm ON abm.var_bill_licenceno = amm.num_mktlice_id AND abm.num_bill_ulbid = aam.num_appli_ulbid
      WHERE
          aam.var_appli_appstatus = 'A'
          AND aam.var_appli_recno IS NULL
          AND aam.dat_appli_recdate IS NULL
          AND aam.num_appli_ulbid = :OrgId
          AND (:LicenseNo IS NULL OR amm.var_mktlice_licenceno = :LicenseNo)
          AND (:BillNo IS NULL OR abm.var_bill_billno = :BillNo)
          AND (:ShopName IS NULL OR aam.var_appli_shopname = :ShopName)
          AND ROWNUM = 1
      ORDER BY
          aam.num_appli_id DESC
    `;

    // 4. Define Bind Parameters
    const binds = {
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
      LicenseNo: { val: trimmedLicenseNo, type: oracledb.STRING }, // Will be null if not provided
      BillNo: { val: trimmedBillNo, type: oracledb.STRING },       // Will be null if not provided
      ShopName: { val: trimmedShopName, type: oracledb.STRING },   // Will be null if not provided
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log("No market license application details found for the provided criteria.");
      return res.status(404).json({
        success: false,
        message: "No market license application details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error fetching market license application details:", error);
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
        message: "Internal Server Error during fetching market license application details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getMarketLicenseApplicationDetails;
