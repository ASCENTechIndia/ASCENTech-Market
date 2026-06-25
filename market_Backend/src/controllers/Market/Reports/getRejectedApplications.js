const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const parts = dateString.split('-');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript Date
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return date.getFullYear() === year &&
         date.getMonth() === month &&
         date.getDate() === day;
};

const getRejectedApplications = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract Input Parameters from the request body
    const { ulbId, FromDt, ToDt, wardId, shopName, panCardNo } = req.body;

    // --- Validation ---
    if (!ulbId || !FromDt || !ToDt || wardId === undefined || wardId === null) {
      console.error("Validation Error: Missing required parameters.");
      return res.status(400).json({
        success: false,
        message: "ulbId, FromDt, ToDt, and wardId are mandatory."
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for ulbId: ${ulbId}. Expected a number.` });
    }

    const parsedWardId = parseInt(wardId, 10);
    if (isNaN(parsedWardId)) {
      console.error(`Validation Error: Invalid wardId: ${wardId}. Expected a number or '-1'.`);
      return res.status(400).json({ success: false, message: `Invalid format for wardId: ${wardId}. Expected a number or '-1'.` });
    }

    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();
    if (!isValidDateDDMMYYYY(trimmedFromDt) || !isValidDateDDMMYYYY(trimmedToDt)) {
      console.error(`Validation Error: Invalid date format or value for FromDt/ToDt. Expected 'DD-MM-YYYY' and valid calendar dates.`);
      return res.status(400).json({
        success: false,
        message: `Invalid date format or value for FromDt ('${FromDt}') or ToDt ('${ToDt}'). Expected 'DD-MM-YYYY' and valid calendar dates.`,
      });
    }

    const trimmedShopName = shopName ? String(shopName).trim() : null;
    const trimmedPanCardNo = panCardNo ? String(panCardNo).trim() : null;

    // 2. Get Database Connection
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_appli_id AS id,
        num_appli_zoneid AS zoneId,
        num_appli_wardid AS wardId,
        TO_CHAR(var_appli_applidt, 'DD-MM-YYYY') AS appDt,
        var_appli_applino AS applino,
        var_appli_placeownername AS ownerName,
        var_appli_shopname AS shopName,
        var_appli_panno AS panNo,
        num_appli_contactno AS contactNo,
        var_appli_address AS address,
        TO_CHAR(dat_appli_approvdt, 'DD-MM-YYYY') AS rejectDt,
        var_appli_rejectreason AS rejectedRemark
      FROM
        aomk_appli_mas
      WHERE
        var_appli_appstatus = 'R'
        AND num_appli_ulbid = :ulbId
        AND TRUNC(var_appli_applidt) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
        AND (:wardId = -1 OR num_appli_wardid = :wardId)
        AND (:shopName IS NULL OR var_appli_shopname = :shopName)
        AND (:panCardNo IS NULL OR var_appli_panno = :panCardNo)
      ORDER BY
        appdt DESC, applino DESC -- Order by application date and number for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
      wardId: { val: parsedWardId, type: oracledb.NUMBER }, // Will be -1 or actual ward ID
      shopName: { val: trimmedShopName, type: oracledb.STRING }, // Will be null if not provided/empty
      panCardNo: { val: trimmedPanCardNo, type: oracledb.STRING }, // Will be null if not provided/empty
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching rejected applications:", error);
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
        message: "Internal Server Error during fetching rejected applications.",
        error: clientError,
      });
    }
  } 
};

module.exports = getRejectedApplications;
