const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FinalFrmReceiptReprint = async (req, res) => {
  let connection;
  let result;

  try {
    const { LicenseId, LICNO, CORPORATION_ID, Receipt_no } = req.body;

    if (!LicenseId || !LICNO || !CORPORATION_ID || !Receipt_no) {
      console.error("Validation Error: Missing required parameters.");
      return res.status(400).json({
        success: false,
        message: "All parameters (LicenseId, LICNO, CORPORATION_ID, Receipt_no) are mandatory.",
      });
    }

    const parsedLicenseId = parseInt(LicenseId, 10);
    const parsedCorporationId = parseInt(CORPORATION_ID, 10);
    const trimmedLicNo = String(LICNO).trim();
    const trimmedReciptNo = String(Receipt_no).trim();

    if (isNaN(parsedLicenseId) || isNaN(parsedCorporationId) || !trimmedLicNo || !trimmedReciptNo) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty parameter values provided.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        var_recipt_rcptno AS RecptNo,
        TRUNC(dat_recipt_insdate) AS RecptDate,
        num_recipt_amount AS Amount,
        var_recipt_insby AS UserName,
        '0' AS Type,
        am.var_appli_placeownername AS appentryname,
        b.var_chargesname_namem AS ChargesName,
        b.num_chargesname_id AS ChargesNameId,
        arm.var_recmode_name AS paymode,
        bcm.bank_name AS bank_name,
        ard.var_recipt_instrumentno AS instrumentno,
        ard.dat_recipt_instrumentdate AS instrumentdate,
        am.var_appli_oldlicencno AS licenseno,
        zone.zonename AS zonename,
        am.var_appli_shopname AS shopname,
        am.var_appli_shopnamemar AS shopnamemar,
        addir.var_applidirector_name AS director_name,
        CASE
          WHEN am.var_appli_type = 'N' THEN 'New'
          WHEN am.var_appli_type = 'R' THEN 'Renewal'
        END AS lictype,
        ard.var_recipt_remark AS remark
      FROM aomk_recipt_def ard
      LEFT JOIN aomk_chargesname_def b ON ard.num_recipt_chargslabid = b.num_chargesname_id
      INNER JOIN aomk_appli_mas am ON am.num_appli_id = ard.num_recipt_appliid AND ard.num_recipt_applino = am.var_appli_applino
      LEFT JOIN prop.aoms_recmode_mas arm ON arm.num_recmode_id = ard.num_recipt_paymode
      LEFT JOIN prop.vw_bankconfig bcm ON bcm.bank_id = ard.num_recipt_banknameid AND bcm.ulbid = ard.num_recipt_ulbid
      INNER JOIN aomk_mktlice_mas mlm ON mlm.num_mktlice_appliid = ard.num_recipt_appliid AND mlm.num_mktlice_ulbid = ard.num_recipt_ulbid
      INNER JOIN prop.vw_zonemas zone ON zone.zoneid = am.num_appli_zoneid AND zone.ulbid = am.num_appli_ulbid
      LEFT JOIN aomk_applidirector_det addir ON addir.num_applidirector_appliid = am.num_appli_id AND addir.num_applidirector_ulbid = am.num_appli_ulbid
      WHERE mlm.num_mktlice_id = :LicenseId1
        AND mlm.var_mktlice_licenceno = :LICNO1
        AND am.num_appli_ulbid = :CORPORATION_ID1
        AND ard.var_recipt_rcptno = :Receipt_no1

      UNION ALL

      SELECT
        var_recipt_rcptno AS RecptNo,
        TRUNC(dat_recipt_insdate) AS RecptDate,
        num_recipt_amount AS Amount,
        var_recipt_insby AS UserName,
        '1' AS Type,
        am.var_appli_placeownername AS appentryname,
        b.var_chargesname_namem AS ChargesName,
        b.num_chargesname_id AS ChargesNameId,
        arm.var_recmode_name AS paymode,
        bcm.bank_name AS bank_name,
        ard.var_recipt_instrumentno AS instrumentno,
        ard.dat_recipt_instrumentdate AS instrumentdate,
        am.var_appli_oldlicencno AS licenseno,
        zone.zonename AS zonename,
        am.var_appli_shopname AS shopname,
        am.var_appli_shopnamemar AS shopnamemar,
        addir.var_applidirector_name AS director_name,
        CASE
          WHEN am.var_appli_type = 'N' THEN 'New'
          WHEN am.var_appli_type = 'R' THEN 'Renewal'
        END AS lictype,
        ard.var_recipt_remark AS remark
      FROM aomk_recipt_def ard
      LEFT JOIN aomk_chargesname_def b ON ard.num_recipt_chargslabid = b.num_chargesname_id
      INNER JOIN aomk_appli_mas am ON am.num_appli_id = ard.num_recipt_appliid AND ard.num_recipt_applino = am.var_appli_applino
      LEFT JOIN prop.aoms_recmode_mas arm ON arm.num_recmode_id = ard.num_recipt_paymode
      LEFT JOIN prop.vw_bankconfig bcm ON bcm.bank_id = ard.num_recipt_banknameid AND bcm.ulbid = ard.num_recipt_ulbid
      INNER JOIN aomk_mktlice_mas mlm ON mlm.num_mktlice_appliid = ard.num_recipt_appliid AND mlm.num_mktlice_ulbid = ard.num_recipt_ulbid
      INNER JOIN prop.vw_zonemas zone ON zone.zoneid = am.num_appli_zoneid AND zone.ulbid = am.num_appli_ulbid
      LEFT JOIN aomk_applidirector_det addir ON addir.num_applidirector_appliid = am.num_appli_id AND addir.num_applidirector_ulbid = am.num_appli_ulbid
      WHERE mlm.num_mktlice_id = :LicenseId2
        AND mlm.var_mktlice_licenceno = :LICNO2
        AND am.num_appli_ulbid = :CORPORATION_ID2
        AND ard.var_recipt_rcptno = :Receipt_no2
    `;

    const binds = {
      LicenseId1: parsedLicenseId,
      LICNO1: trimmedLicNo,
      CORPORATION_ID1: parsedCorporationId,
      Receipt_no1: trimmedReciptNo,
      LicenseId2: parsedLicenseId,
      LICNO2: trimmedLicNo,
      CORPORATION_ID2: parsedCorporationId,
      Receipt_no2: trimmedReciptNo,
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No comprehensive receipt details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching comprehensive receipt details:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching comprehensive receipt details.",
        error: {
          message: error.message,
          code: error.code,
          oracleErrorNum: error.errorNum
        }
      });
    }
  }
};

module.exports = FinalFrmReceiptReprint;

