const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const parts = dateString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript Date
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

const getAppliPrintDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, wardId, shopName, panCardNo, FromDt, ToDt } = req.body;

    // --- Validation ---
    if (!ulbId) {
      console.error("Validation Error: Missing required parameter: ulbId.");
      return res
        .status(400)
        .json({ success: false, message: "ULB ID is mandatory." });
    }
    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
        });
    }

    if (wardId === undefined || wardId === null) {
      console.error("Validation Error: Missing required parameter: wardId.");
      return res
        .status(400)
        .json({
          success: false,
          message: "Ward ID is mandatory. Use '-1' for all wards.",
        });
    }
    const parsedWardId = parseInt(wardId, 10);
    if (isNaN(parsedWardId)) {
      console.error(
        `Validation Error: Invalid wardId: ${wardId}. Expected a number or '-1'.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for wardId: ${wardId}. Expected a number or '-1'.`,
        });
    }

    const trimmedShopName = shopName ? String(shopName).trim() : null;
    const trimmedPanCardNo = panCardNo ? String(panCardNo).trim() : null;

    const useDateFilter =
      (!trimmedShopName || trimmedShopName === "") &&
      (!trimmedPanCardNo || trimmedPanCardNo === "");

    if (useDateFilter) {
      if (!FromDt || !ToDt) {
        console.error(
          "Validation Error: FromDt and ToDt are mandatory when shopName and panCardNo are not provided."
        );
        return res.status(400).json({
          success: false,
          message:
            "FromDt and ToDt are mandatory if shopName and panCardNo are not provided.",
        });
      }
      if (!isValidDateDDMMYYYY(FromDt.trim())) {
        console.error(
          `Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
        });
      }
      if (!isValidDateDDMMYYYY(ToDt.trim())) {
        console.error(
          `Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
        });
      }
    } else {
      // If shopName or panCardNo are provided, date filters are not active in SQL,
      // but we still trim them for consistency if they exist.
      // No need to validate their date format if they won't be used as dates.
    }

    // 2. Get Database Connection
    connection = await getConnection();
    console.log(
      "Database connection established for application print details query."
    );

    // 3. Define the SQL Query
    // The WHERE clause complex logic is implemented directly in SQL
    // by relying on NULLs and the TRIM() function as per the original query's intent.
    const sqlQuery = `
      SELECT DISTINCT
        id, applino AS applicationNo, appdt AS applicationDate,
        shop_name AS shopName, pan_cardno AS panCardNo,
        contactno AS contactNo, email AS email, address AS address,
        d_gender AS gender
      FROM
        view_appliprint
      WHERE
        ulbid = :ulbId
        AND (:wardId = -1 OR ward = :wardId) -- Use -1 as wildcard for ward
        AND (
          (TRIM(:shopNameParam) IS NOT NULL AND TRIM(shop_name) = TRIM(:shopNameParam))
          OR (TRIM(:panCardNoParam) IS NOT NULL AND pan_cardno = :panCardNoParam)
          OR (
            (TRIM(:shopNameParam) IS NULL OR TRIM(:shopNameParam) = '') AND -- Both must be null/empty for date filter to activate
            (TRIM(:panCardNoParam) IS NULL OR TRIM(:panCardNoParam) = '') AND
            TRUNC(appdt) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
          )
        )
      ORDER BY
        applino DESC -- Added an ORDER BY for consistent results
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      wardId: { val: parsedWardId, type: oracledb.NUMBER }, // Will be -1 or actual ward ID
      shopNameParam: { val: trimmedShopName, type: oracledb.STRING }, // Will be null if not provided
      panCardNoParam: { val: trimmedPanCardNo, type: oracledb.STRING }, // Will be null if not provided
      FromDt: {
        val: useDateFilter ? FromDt.trim() : null,
        type: oracledb.STRING,
      }, // Only bind if date filter is active
      ToDt: { val: useDateFilter ? ToDt.trim() : null, type: oracledb.STRING }, // Only bind if date filter is active
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching application print details:", error);
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
          "Internal Server Error during fetching application print details.",
        error: clientError,
      });
    }
  }
};

module.exports = getAppliPrintDetails;
