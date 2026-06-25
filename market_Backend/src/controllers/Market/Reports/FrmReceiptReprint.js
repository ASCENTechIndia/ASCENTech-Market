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

const FrmReceiptReprint = async (req, res) => {
  let connection;
  let result;

  try {
    const { ULB_ID, FROM_DATE, TO_DATE, RECEIPT_NO } = req.body;

    if (!ULB_ID) {
      console.error("Validation Error: Missing required parameter: ULB_ID.");
      return res.status(400).json({ success: false, message: "ULB_ID is mandatory." });
    }

    const parsedUlbId = parseInt(ULB_ID, 10);
    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid ULB_ID: ${ULB_ID}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for ULB_ID: ${ULB_ID}. Expected a number.` });
    }

    let trimmedFromDt = null;
    let trimmedToDt = null;

    if (FROM_DATE) {
      trimmedFromDt = String(FROM_DATE).trim();
      if (!isValidDateDDMMYYYY(trimmedFromDt)) {
        console.error(`Validation Error: Invalid FROM_DATE format or value: ${FROM_DATE}. Expected 'DD-MM-YYYY' and a valid calendar date.`);
        return res.status(400).json({
          success: false,
          message: `Invalid format or value for FROM_DATE: '${FROM_DATE}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
        });
      }
    }

    if (TO_DATE) {
      trimmedToDt = String(TO_DATE).trim();
      if (!isValidDateDDMMYYYY(trimmedToDt)) {
        console.error(`Validation Error: Invalid TO_DATE format or value: ${TO_DATE}. Expected 'DD-MM-YYYY' and a valid calendar date.`);
        return res.status(400).json({
          success: false,
          message: `Invalid format or value for TO_DATE: '${TO_DATE}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
        });
      }
    }

    const trimmedReceiptNo = RECEIPT_NO ? String(RECEIPT_NO).trim() : null;

    connection = await getConnection();

    const baseSqlQuery = `
      SELECT
        am.num_appli_id AS applicationid,
        mlm.num_mktlice_id AS lice_id,
        vwm.wardname AS wardname,
        am.var_appli_applino AS applicationno,
        mlm.var_mktlice_licenceno AS licno,
        am.var_appli_shopname AS shopname,
        am.num_appli_busstartyr AS businessyear,
        ard.var_recipt_rcptno AS rcptno,
        TO_CHAR(ard.dat_recipt_insdate, 'DD-MM-YYYY') AS reciptdate,
        ard.num_recipt_amount AS recamount
      FROM
        aomk_appli_mas am
      INNER JOIN
        aomk_mktlice_mas mlm ON mlm.num_mktlice_appliid = am.num_appli_id
      INNER JOIN
        aomk_bill_mas abm ON abm.var_bill_licenceno = mlm.num_mktlice_id
        AND abm.num_bill_ulbid = am.num_appli_ulbid
      INNER JOIN
        aomk_recipt_def ard ON ard.var_recipt_rcptno = am.var_appli_recno
        AND ard.num_recipt_appliid = am.num_appli_id
        AND ard.num_recipt_ulbid = am.num_appli_ulbid
      INNER JOIN
        prop.vw_ward_mas vwm ON vwm.wardid = am.num_appli_wardid
        AND vwm.ulbid = am.num_appli_ulbid
      WHERE
        am.var_appli_recno IS NOT NULL
        AND am.dat_appli_recdate IS NOT NULL
        AND am.num_appli_ulbid = :ULB_ID
    `;

    let whereConditions = [];
    const binds = { ULB_ID: { val: parsedUlbId, type: oracledb.NUMBER } };

    // Dynamically add optional filters
    if (trimmedFromDt && trimmedToDt) {
      whereConditions.push("TRUNC(ard.dat_recipt_insdate) BETWEEN TO_DATE(:FROM_DATE, 'DD-MM-YYYY') AND TO_DATE(:TO_DATE, 'DD-MM-YYYY')");
      binds.FROM_DATE = { val: trimmedFromDt, type: oracledb.STRING };
      binds.TO_DATE = { val: trimmedToDt, type: oracledb.STRING };
    }
    if (trimmedReceiptNo) {
      whereConditions.push("ard.var_recipt_rcptno = :RECEIPT_NO");
      binds.RECEIPT_NO = { val: trimmedReceiptNo, type: oracledb.STRING };
    }

    let finalSqlQuery = baseSqlQuery;
    if (whereConditions.length > 0) {
      finalSqlQuery += " AND " + whereConditions.join(" AND ");
    }
    finalSqlQuery += " ORDER BY ard.dat_recipt_insdate DESC, ard.var_recipt_rcptno DESC"; // Add an ORDER BY for consistent results

    result = await connection.execute(finalSqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log("No market license and receipt details found for the provided criteria.");
      return res.status(404).json({
        success: false,
        message: "No market license and receipt details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching market license and receipt details:", error);
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
        message: "Internal Server Error during fetching market license and receipt details.",
        error: clientError,
      });
    }
  } 
};

module.exports = FrmReceiptReprint;
