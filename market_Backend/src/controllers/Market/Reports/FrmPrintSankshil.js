const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const isValidDateYYYYMMDD = (dateString) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

  const parts = dateString.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; 
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return date.getFullYear() === year &&
         date.getMonth() === month &&
         date.getDate() === day;
};

const FrmPrintSankshil = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { FromDt, ToDt, OrgId, ZoneId, TradeCategoryId, TradeTypeId } = req.body;

    // --- Mandatory Parameter Validation ---
    if (!FromDt || !ToDt || !OrgId) {
      console.error("Validation Error: Missing required parameters in request body (FromDt, ToDt, OrgId).");
      return res.status(400).json({ success: false, message: "FromDt, ToDt, and OrgId are mandatory." });
    }

    // Trim and validate date strings
    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateYYYYMMDD(trimmedFromDt)) {
      console.error(`Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'YYYY-MM-DD' and a valid calendar date.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'YYYY-MM-DD' and a valid calendar date.`,
      });
    }
    if (!isValidDateYYYYMMDD(trimmedToDt)) {
      console.error(`Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'YYYY-MM-DD' and a valid calendar date.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'YYYY-MM-DD' and a valid calendar date.`,
      });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(`Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for OrgId: ${OrgId}. Expected a number.` });
    }

    const zoneIdParam = (ZoneId === undefined || ZoneId === null || String(ZoneId).trim() === '') ? null : String(ZoneId).trim();
    if (zoneIdParam !== null && zoneIdParam !== '-1' && isNaN(parseInt(zoneIdParam, 10))) {
        console.error(`Validation Error: Invalid ZoneId: ${ZoneId}. Expected a number or '-1'.`);
        return res.status(400).json({ success: false, message: `Invalid format for ZoneId: ${ZoneId}. Expected a number or '-1'.` });
    }

    const tradeCategoryIdParam = (TradeCategoryId === undefined || TradeCategoryId === null || String(TradeCategoryId).trim() === '') ? null : String(TradeCategoryId).trim();
    if (tradeCategoryIdParam !== null && tradeCategoryIdParam !== '-1' && isNaN(parseInt(tradeCategoryIdParam, 10))) {
        console.error(`Validation Error: Invalid TradeCategoryId: ${TradeCategoryId}. Expected a number or '-1'.`);
        return res.status(400).json({ success: false, message: `Invalid format for TradeCategoryId: ${TradeCategoryId}. Expected a number or '-1'.` });
    }

    const tradeTypeIdParam = (TradeTypeId === undefined || TradeTypeId === null || String(TradeTypeId).trim() === '') ? null : String(TradeTypeId).trim();
    if (tradeTypeIdParam !== null && tradeTypeIdParam !== '-1' && isNaN(parseInt(tradeTypeIdParam, 10))) {
        console.error(`Validation Error: Invalid TradeTypeId: ${TradeTypeId}. Expected a number or '-1'.`);
        return res.status(400).json({ success: false, message: `Invalid format for TradeTypeId: ${TradeTypeId}. Expected a number or '-1'.` });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        ap.num_appli_id AS appliId,
        a.var_recipt_rcptno AS ReceiptNo,
        a.num_recipt_id AS ReceiptId,
        a.dat_recipt_insdate AS ReceiptInsDate,
        NVL(ap.num_appli_amount, 0) AS Amount,
        ap.var_appli_placeownername AS Name,
        prm.var_recmode_name AS recmodename
      FROM
        MARKET.aomk_recipt_def a
      INNER JOIN
        MARKET.aomk_appli_mas ap ON a.num_recipt_appliid = ap.num_appli_id
        AND a.num_recipt_applino = ap.var_appli_applino
        AND ap.num_appli_wardid = a.num_recipt_collcenterid
      INNER JOIN
        prop.aoms_recmode_mas prm ON prm.num_recmode_id = a.num_recipt_paymode
      INNER JOIN
        MARKET.aomk_applitradetyp_det attd ON attd.num_applitradetype_appliid = ap.num_appli_id
      INNER JOIN
        MARKET.aomk_rate_mas arm ON arm.num_rate_id = attd.num_applitradetype_trdtypid
      INNER JOIN
        MARKET.aomk_tradetype_mas atm ON atm.num_tradetype_id = arm.num_rate_tradetypeid
        AND arm.num_rate_ulbid = atm.aomk_tradetype_ulbid
      INNER JOIN
        MARKET.aomk_tradecategory_mas atcm ON atcm.num_tradecategory_id = atm.aomk_tradetype_tradecategoryid
        AND atcm.num_tradecategory_ulbid = atm.aomk_tradetype_ulbid
      WHERE
        TRUNC(a.dat_recipt_insdate) BETWEEN TO_DATE(:FromDt, 'YYYY-MM-DD') AND TO_DATE(:ToDt, 'YYYY-MM-DD')
        AND a.num_recipt_ulbid = :OrgId
        AND (
          :zoneIdParam = '-1' OR :zoneIdParam IS NULL OR ap.num_appli_wardid = TO_NUMBER(:zoneIdParam)
        )
        AND (
          :tradeCategoryIdParam = '-1' OR :tradeCategoryIdParam IS NULL OR atcm.num_tradecategory_id = TO_NUMBER(:tradeCategoryIdParam)
        )
        AND (
          :tradeTypeIdParam = '-1' OR :tradeTypeIdParam IS NULL OR arm.num_rate_id = TO_NUMBER(:tradeTypeIdParam)
        )
      ORDER BY ReceiptInsDate ASC
    `;

    // 4. Define Bind Parameters
    const binds = {
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
      zoneIdParam: { val: zoneIdParam, type: oracledb.STRING }, // Bind as string for '-1' or null
      tradeCategoryIdParam: { val: tradeCategoryIdParam, type: oracledb.STRING }, // Bind as string for '-1' or null
      tradeTypeIdParam: { val: tradeTypeIdParam, type: oracledb.STRING }, // Bind as string for '-1' or null
    };


    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching detailed receipts list:", error);
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
        message: "Internal Server Error during fetching detailed receipts list.",
        error: clientError,
      });
    }
  } 
};

module.exports = FrmPrintSankshil;
