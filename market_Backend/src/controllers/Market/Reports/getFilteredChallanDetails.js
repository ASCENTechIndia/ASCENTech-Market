const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const parts = dateString.split('-');
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; 
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return date.getFullYear() === year &&
         date.getMonth() === month &&
         date.getDate() === day;
};

const getFilteredChallanDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { ChallanDate, OrgId, PrabhagId, PayMode, FromDt, ToDt } = req.body;

    if (!ChallanDate || !OrgId || !PrabhagId || !PayMode || !FromDt || !ToDt) {
      console.error("Validation Error: Missing required parameters in request body.");
      return res.status(400).json({
        success: false,
        message: "All parameters (ChallanDate, OrgId, PrabhagId, PayMode, FromDt, ToDt) are mandatory.",
      });
    }

    const trimmedChallanDate = ChallanDate.trim();
    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateDDMMYYYY(trimmedChallanDate)) {
      console.error(`Validation Error: Invalid ChallanDate format or value: ${ChallanDate}. Expected 'DD-MM-YYYY' and a valid calendar date.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for ChallanDate: '${ChallanDate}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }
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

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(`Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for OrgId: ${OrgId}. Expected a number.` });
    }

    const parsedPrabhagId = parseInt(PrabhagId, 10);
    if (isNaN(parsedPrabhagId)) {
      console.error(`Validation Error: Invalid PrabhagId: ${PrabhagId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for PrabhagId: ${PrabhagId}. Expected a number.` });
    }

    const trimmedPayMode = PayMode.trim();
    if (typeof trimmedPayMode !== 'string' || trimmedPayMode === '') {
      console.error(`Validation Error: Invalid PayMode: ${PayMode}. Expected a non-empty string.`);
      return res.status(400).json({ success: false, message: `Invalid format for PayMode: ${PayMode}. Expected a non-empty string.` });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        *
      FROM
        MARKET.aomk_genrctchalan_mas
      WHERE
        TRUNC(dat_chalan_chalandate) = TO_DATE(:ChallanDate, 'DD-MM-YYYY')
        AND num_chalan_ulbid = :OrgId
        AND num_chalan_collcenterid = :PrabhagId
        AND var_chalan_paymode = :PayMode
        AND TRUNC(dat_chalan_receiptfromdate) >= TO_DATE(:FromDt, 'DD-MM-YYYY')
        AND TRUNC(dat_chalan_receipttodate) <= TO_DATE(:ToDt, 'DD-MM-YYYY')
      ORDER BY
        dat_chalan_chalandate ASC -- Order by challan date for consistent results
    `;

    const binds = {
      ChallanDate: { val: trimmedChallanDate, type: oracledb.STRING },
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
      PrabhagId: { val: parsedPrabhagId, type: oracledb.NUMBER },
      PayMode: { val: trimmedPayMode, type: oracledb.STRING },
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching direct challan details:", error);
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
        message: "Internal Server Error during fetching direct challan details.",
        error: clientError,
      });
    }
  }
};

module.exports = getFilteredChallanDetails;
