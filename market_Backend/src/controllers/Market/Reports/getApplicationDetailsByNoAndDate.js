const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const parts = dateString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

const getApplicationDetailsByNoAndDate = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId, FromDt, ToDt, applicationNo } = req.body;

    // Validate mandatory parameters
    if (!ulbId || !FromDt || !ToDt) {
      console.error(
        "Validation Error: Missing required parameters in request body (ulbId, FromDt, ToDt)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: ulbId, FromDt, and ToDt are mandatory.",
      });
    }

    // Parse and validate ULB ID
    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input for ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    // Trim and validate date strings
    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateDDMMYYYY(trimmedFromDt)) {
      console.error(
        `Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }
    if (!isValidDateDDMMYYYY(trimmedToDt)) {
      console.error(
        `Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }

    const trimmedApplicationNo = applicationNo
      ? String(applicationNo).trim()
      : null;

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_appli_id AS AppID,
        var_appli_applino AS applino,
        var_appli_shopname AS shopname,
        var_appli_applidt AS applidt, -- Keeping as DATE type as per original query's return, format later if needed
        var_appli_address AS address,
        NVL(num_appli_amount, 0) AS amount
      FROM
        aomk_appli_mas
      WHERE
        num_appli_ulbid = :ulbId
        AND (:applicationNo IS NULL OR var_appli_applino = :applicationNo)
        AND TRUNC(var_appli_applidt) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
      ORDER BY
        applidt DESC, applino DESC -- Order for consistent results
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      applicationNo: { val: trimmedApplicationNo, type: oracledb.STRING },
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching application details:", error);
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
        message: "Internal Server Error during fetching application details.",
        error: clientError,
      });
    }
  }
};

module.exports = getApplicationDetailsByNoAndDate;
