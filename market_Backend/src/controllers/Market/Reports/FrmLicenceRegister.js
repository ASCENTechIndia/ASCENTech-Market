const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure

/**
 * Helper function to validate if a date string is in 'DD-MM-YYYY' format and is a valid calendar date.
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} True if the date string is valid, false otherwise.
 */
const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const parts = dateString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript Date
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  // Check if the date object components match the input components,
  // preventing issues like September 31st rolling over to October 1st.
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

/**
 * API endpoint to retrieve Market License Register Report data from view_licensereg.
 * It filters by ULB ID, a transaction date range, and optionally by Zone ID.
 * This API expects parameters in the request body via a POST request.
 *
 * @param {object} req - The Express request object, containing parameters in req.body.
 * @param {object} res - The Express response object, used to send the JSON data.
 *
 * Request Body Parameters (JSON):
 * {
 * "ulbId": "101",            // Mandatory. The Urban Local Body ID. Expected to be a number.
 * "FromDt": "01-06-2024",    // Mandatory. Start date string in 'DD-MM-YYYY' format.
 * "ToDt": "10-06-2024",      // Mandatory. End date string in 'DD-MM-YYYY' format.
 * "zoneId": "5" or "-1"      // Optional. The Zone ID. Use '-1' to include all zones. Expected to be a number or string '-1'.
 * }
 */
const FrmLicenceRegister = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId, FromDt, ToDt, zoneId } = req.body;

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

    // Trim and validate date strings using the updated helper
    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateDDMMYYYY(trimmedFromDt)) {
      // Using isValidDateDDMMYYYY
      console.error(
        `Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }
    if (!isValidDateDDMMYYYY(trimmedToDt)) {
      // Using isValidDateDDMMYYYY
      console.error(
        `Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }

    // Parse optional zoneId (handle '-1' for all zones)
    let parsedZoneId = null;
    if (
      zoneId !== undefined &&
      zoneId !== null &&
      String(zoneId) !== "-1" &&
      String(zoneId).trim() !== ""
    ) {
      parsedZoneId = parseInt(zoneId, 10);
      if (isNaN(parsedZoneId)) {
        console.error(
          `Validation Error: Invalid input for zoneId: ${zoneId}. Expected a number or '-1'.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format for zoneId: ${zoneId}. Expected a number or '-1'.`,
        });
      }
    } else if (String(zoneId) === "-1") {
      parsedZoneId = -1; // Explicitly set to -1 for the SQL condition
    }

    // 2. Get Database Connection
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        licenceno AS licenseNo,
        LICENSE_TYPE AS licenseType,
        shopname AS shopName,
        address AS address,
        proprietor_name AS proprietorName,
        proprietor_address AS proprietorAddress,
        business_type AS businessType,
        mobileno AS mobileNo,
        fromdt AS fromDate,
        todt AS toDate,
        renewaldate AS renewalDate,
        appl_amt AS applicationAmount,
        zonename AS zoneName
      FROM
        view_licensereg
      WHERE
        ulbid = :ulbId
        AND TRUNC(market_date) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
        AND (:zoneId = -1 OR zoneid = :zoneId)
      ORDER BY
        licenceno DESC -- Added an ORDER BY for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
      zoneId: { val: parsedZoneId, type: oracledb.NUMBER }, // Will be -1 or actual zone ID
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching Market License Register Report:", error);
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
        message:
          "Internal Server Error during fetching Market License Register Report.",
        error: clientError,
      });
    }
  }
};

module.exports = FrmLicenceRegister;
