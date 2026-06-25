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
 * API endpoint to retrieve a list of applications based on various filters.
 * It fetches data by joining several market-related tables and filters by
 * date range, ULB ID, and optional Zone ID, Trade Category ID, and Trade Type ID.
 * This API expects parameters in the request body via a POST request.
 *
 * @param {object} req - The Express request object, containing parameters in req.body.
 * @param {object} res - The Express response object, used to send the JSON data.
 *
 * Request Body Parameters (JSON):
 * {
 * "FromDt": "01-05-2024",        // Mandatory. Start date string in 'DD-MM-YYYY' format.
 * "ToDt": "10-06-2024",          // Mandatory. End date string in 'DD-MM-YYYY' format.
 * "OrgId": "101",                // Mandatory. The Organization ID (ULB ID). Expected to be a number.
 * "ZoneId": "-1",                // Optional. The Zone ID. Use '-1' for all zones, or a specific number. Can be null/empty.
 * "TradeCategoryId": "-1",       // Optional. The Trade Category ID. Use '-1' for all categories, or a specific number. Can be null/empty.
 * "TradeTypeId": "-1"            // Optional. The Trade Type ID. Use '-1' for all trade types, or a specific number. Can be null/empty.
 * }
 */
const FrmPrintTapshil = async (req, res) => {
  // Renamed function as requested
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { FromDt, ToDt, OrgId, ZoneId, TradeCategoryId, TradeTypeId } =
      req.body;

    // --- Mandatory Parameter Validation ---
    if (!FromDt || !ToDt || !OrgId) {
      console.error(
        "Validation Error: Missing required parameters in request body (FromDt, ToDt, OrgId)."
      );
      return res
        .status(400)
        .json({
          success: false,
          message: "FromDt, ToDt, and OrgId are mandatory.",
        });
    }

    // Trim and validate date strings - NOW using DD-MM-YYYY format
    const trimmedFromDt = FromDt.trim();
    const trimmedToDt = ToDt.trim();

    if (!isValidDateDDMMYYYY(trimmedFromDt)) {
      // Using the updated helper
      console.error(
        `Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }
    if (!isValidDateDDMMYYYY(trimmedToDt)) {
      // Using the updated helper
      console.error(
        `Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
      });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(
        `Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for OrgId: ${OrgId}. Expected a number.`,
        });
    }

    // --- Optional Parameters Handling ---
    // Convert to string or null if not provided, then validate if it's a number or '-1'
    const zoneIdParam =
      ZoneId === undefined || ZoneId === null || String(ZoneId).trim() === ""
        ? null
        : String(ZoneId).trim();
    if (
      zoneIdParam !== null &&
      zoneIdParam !== "-1" &&
      isNaN(parseInt(zoneIdParam, 10))
    ) {
      console.error(
        `Validation Error: Invalid ZoneId: ${ZoneId}. Expected a number or '-1'.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for ZoneId: ${ZoneId}. Expected a number or '-1'.`,
        });
    }

    const tradeCategoryIdParam =
      TradeCategoryId === undefined ||
      TradeCategoryId === null ||
      String(TradeCategoryId).trim() === ""
        ? null
        : String(TradeCategoryId).trim();
    if (
      tradeCategoryIdParam !== null &&
      tradeCategoryIdParam !== "-1" &&
      isNaN(parseInt(tradeCategoryIdParam, 10))
    ) {
      console.error(
        `Validation Error: Invalid TradeCategoryId: ${TradeCategoryId}. Expected a number or '-1'.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for TradeCategoryId: ${TradeCategoryId}. Expected a number or '-1'.`,
        });
    }

    const tradeTypeIdParam =
      TradeTypeId === undefined ||
      TradeTypeId === null ||
      String(TradeTypeId).trim() === ""
        ? null
        : String(TradeTypeId).trim();
    if (
      tradeTypeIdParam !== null &&
      tradeTypeIdParam !== "-1" &&
      isNaN(parseInt(tradeTypeIdParam, 10))
    ) {
      console.error(
        `Validation Error: Invalid TradeTypeId: ${TradeTypeId}. Expected a number or '-1'.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for TradeTypeId: ${TradeTypeId}. Expected a number or '-1'.`,
        });
    }

    // 2. Get Database Connection
    connection = await getConnection();
    console.log(
      "Database connection established for applications by filters query."
    );

    // 3. Define the SQL Query
    // Qualified tables with their respective schemas (MARKET)
    // FIX: Changed TO_DATE format to 'DD-MM-YYYY'
    const sqlQuery = `
      SELECT
        apm.var_appli_applino AS applino,
        apm.var_appli_shopname AS shopname,
        apm.var_appli_placeownername AS placeownername,
        apm.dat_appli_insdt AS insdt,
        apm.dat_appli_approvdt AS Appdt
      FROM
        MARKET.aomk_appli_mas apm
      INNER JOIN
        MARKET.aomk_applitradetyp_det attd ON attd.num_applitradetype_appliid = apm.num_appli_id
      INNER JOIN
        MARKET.aomk_rate_mas arm ON arm.num_rate_id = attd.num_applitradetype_trdtypid
      INNER JOIN
        MARKET.aomk_tradetype_mas atm ON atm.num_tradetype_id = arm.num_rate_tradetypeid
        AND arm.num_rate_ulbid = atm.aomk_tradetype_ulbid
      INNER JOIN
        MARKET.aomk_tradecategory_mas atcm ON atcm.num_tradecategory_id = atm.aomk_tradetype_tradecategoryid
        AND atcm.num_tradecategory_ulbid = atm.aomk_tradetype_ulbid
      WHERE
        TRUNC(apm.dat_appli_insdt) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
        AND apm.num_appli_ulbid = :OrgId
        AND (
          :zoneIdParam = '-1' OR :zoneIdParam IS NULL OR apm.num_appli_wardid = TO_NUMBER(:zoneIdParam)
        )
        AND (
          :tradeCategoryIdParam = '-1' OR :tradeCategoryIdParam IS NULL OR atcm.num_tradecategory_id = TO_NUMBER(:tradeCategoryIdParam)
        )
        AND (
          :tradeTypeIdParam = '-1' OR :tradeTypeIdParam IS NULL OR arm.num_rate_id = TO_NUMBER(:tradeTypeIdParam)
        )
      ORDER BY apm.dat_appli_insdt ASC
    `;

    // 4. Define Bind Parameters
    const binds = {
      FromDt: { val: trimmedFromDt, type: oracledb.STRING },
      ToDt: { val: trimmedToDt, type: oracledb.STRING },
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
      zoneIdParam: { val: zoneIdParam, type: oracledb.STRING }, // Bind as string for '-1' or null
      tradeCategoryIdParam: {
        val: tradeCategoryIdParam,
        type: oracledb.STRING,
      }, // Bind as string for '-1' or null
      tradeTypeIdParam: { val: tradeTypeIdParam, type: oracledb.STRING }, // Bind as string for '-1' or null
    };

    console.log("Executing SQL Query with binds:", binds);

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    console.log(
      `Found ${
        result.rows.length
      } applications for OrgId: ${OrgId}, FromDt: ${FromDt}, ToDt: ${ToDt}, ZoneId: ${
        ZoneId || "N/A"
      }, TradeCategoryId: ${TradeCategoryId || "N/A"}, TradeTypeId: ${
        TradeTypeId || "N/A"
      }`
    );

    // 6. Send the Results as JSON Response
    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching applications by filters:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
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
          "Internal Server Error during fetching applications by filters.",
        error: clientError,
      });
    }
  }
};

module.exports = FrmPrintTapshil;
