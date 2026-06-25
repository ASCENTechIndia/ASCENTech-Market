const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure

const isValidDateDDMMYYYY = (dateString) => { // Renamed helper function
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

const getGenReceiptChallan = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { FromDt, ToDt, PrabhagId, OrgId, PayMode } = req.body;

    // --- Mandatory Parameter Validation ---
    if (!FromDt || !ToDt || !PrabhagId || !OrgId || !PayMode) {
      console.error("Validation Error: Missing required parameters in request body (FromDt, ToDt, PrabhagId, OrgId, PayMode).");
      return res.status(400).json({ success: false, message: "FromDt, ToDt, PrabhagId, OrgId, and PayMode are mandatory." });
    }

    // Trim and validate date strings - NOW using DD-MM-YYYY format
    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateDDMMYYYY(trimmedFromDt)) { // Using the updated helper
      console.error(`Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }
    if (!isValidDateDDMMYYYY(trimmedToDt)) { // Using the updated helper
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
        vgc.RECEIPTNO AS ReceiptNo,
        vgc.RECEIVEAMT AS ReceiveAmount,
        vgc.RECEIPTDATE AS ReceiptDate,
        vgc.PRABHAGID AS PrabhagId,
        vgc.PRABHAG AS Prabhag,
        vgc.SERVICENAME AS ServiceName,
        vgc.ULBID AS UlbId,
        agm.var_chalan_number AS ChallanNumber,
        agm.var_chalan_paymode AS ChallanPayMode
      FROM
        view_genrctchallan vgc
      INNER JOIN
        MARKET.aomk_genrctchalan_mas agm ON TRUNC(vgc.receiptdate) = TRUNC(agm.dat_chalan_chalandate)
        AND vgc.chalanno = agm.var_chalan_number
        AND vgc.ulbid = agm.num_chalan_ulbid
        AND agm.num_chalan_collcenterid = :prabhagIdInJoin -- Use bind for PrabhagId in JOIN
      WHERE
        TRUNC(vgc.receiptdate) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY') -- FIX: Changed TO_DATE format here
        AND vgc.prabhagid = :PrabhagIdInWhere -- Use bind for PrabhagId in WHERE
        AND vgc.ulbid = :OrgId
        AND vgc.paymode = :PayMode
      ORDER BY
        vgc.RECEIPTDATE ASC
    `;

    const binds = {
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
      prabhagIdInJoin: { val: parsedPrabhagId, type: oracledb.NUMBER },
      PrabhagIdInWhere: { val: parsedPrabhagId, type: oracledb.NUMBER }, // Same value, but distinct bind names for clarity
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
    console.error("Error fetching general receipt and challan details:", error);
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
        message: "Internal Server Error during fetching general receipt and challan details.",
        error: clientError,
      });
    }
  } 
};

const getWardNamesAndIdsByUlbId = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId } = req.body;

    if (!ulbId) {
      console.error(
        "Validation Error: Missing required parameter in request body (ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameter in request body: ulbId is mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        wardname AS wardName,
        wardid AS wardId
      FROM
        prop.vw_ward_mas
      WHERE
        ulbid = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
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
    console.error("Error fetching ward names and IDs:", error);
    if (!res.headersSent) {
      const clientError = {
        message:
          error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        clientError.code = error.code;
      }
      if (error.errorNum) {
        clientError.oracleErrorNum = error.errorNum;
      }
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching ward names and IDs.",
        error: clientError,
      });
    }
  }
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


const getRecModeConfig = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId } = req.body;

    if (!ulbId) {
      console.error("Validation Error: Missing required parameter in request body (ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter in request body: ulbId is mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        rm.var_recmode_name AS recModeName,
        rm.num_recmode_id AS recModeId
      FROM
        prop.aoms_recmodeconfig_mas rcm
      INNER JOIN
        prop.aoms_recmode_mas rm ON rm.num_recmode_id = rcm.num_recmodeconfig_recmodeid
      WHERE
        rcm.num_recmodeeconfig_ulbid = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching receipt mode configurations:", error);
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
        message: "Internal Server Error during fetching receipt mode configurations.",
        error: clientError,
      });
    }
  }
};

module.exports = {getGenReceiptChallan, getFilteredChallanDetails, getFilteredGeneralReceipts, getWardNamesAndIdsByUlbId, getRecModeConfig  };