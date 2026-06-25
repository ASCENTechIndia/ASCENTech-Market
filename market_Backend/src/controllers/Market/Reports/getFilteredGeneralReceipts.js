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

const getFilteredGeneralReceipts = async (req, res) => {
  let connection;
  let result;

  try {
    const { FromDt, ToDt, PrabhagId, OrgId, PayMode } = req.body;

    if (!FromDt || !ToDt || !PrabhagId || !OrgId || !PayMode) {
      console.error("Validation Error: Missing required parameters in request body (FromDt, ToDt, PrabhagId, OrgId, PayMode).");
      return res.status(400).json({ success: false, message: "FromDt, ToDt, PrabhagId, OrgId, and PayMode are mandatory." });
    }

    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateDDMMYYYY(trimmedFromDt)) {
      console.error(`Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }
    if (!isValidDateDDMMYYYY(trimmedToDt)) {
      console.error(`Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }

    const parsedPrabhagId = parseInt(PrabhagId, 10);
    if (isNaN(parsedPrabhagId)) {
      console.error(`Validation Error: Invalid PrabhagId: ${PrabhagId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for PrabhagId: ${PrabhagId}. Expected a number.` });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(`Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for OrgId: ${OrgId}. Expected a number.` });
    }

    const trimmedPayMode = PayMode.trim();
    if (typeof trimmedPayMode !== 'string' || trimmedPayMode === '') {
      console.error(`Validation Error: Invalid PayMode: ${PayMode}. Expected a non-empty string.`);
      return res.status(400).json({ success: false, message: `Invalid format for PayMode: ${PayMode}. Expected a non-empty string.` });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        RECEIPTNO AS ReceiptNo,
        RECEIVEAMT AS ReceiveAmount,
        RECEIPTDATE AS ReceiptDate,
        PRABHAGID AS PrabhagId,
        PRABHAG AS Prabhag,
        SERVICENAME AS ServiceName,
        ULBID AS UlbId
      FROM
        view_genrctchallan
      WHERE
        TRUNC(receiptdate) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
        AND prabhagid = :PrabhagId
        AND ulbid = :OrgId
        AND paymode = :PayMode
      ORDER BY
        RECEIPTDATE ASC
    `;

    // 4. Define Bind Parameters
    const binds = {
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
      PrabhagId: { val: parsedPrabhagId, type: oracledb.NUMBER },
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
      PayMode: { val: trimmedPayMode, type: oracledb.STRING },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching filtered general receipts:", error);
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
        message: "Internal Server Error during fetching filtered general receipts.",
        error: clientError,
      });
    }
  } 
};

module.exports = getFilteredGeneralReceipts;
