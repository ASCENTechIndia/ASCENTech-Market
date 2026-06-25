const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getApplicantTradeTypes = async (req, res) => {
  let connection; // Declare connection variable to ensure it's accessible in finally block
  let result; // Declare result variable

  try {
    // 1. Extract parameters from the request body
    const { appliId, ulbId } = req.body;

    // 2. Input Validation - Check if required parameters are present
    if (
      appliId === undefined ||
      appliId === null ||
      appliId === "" ||
      ulbId === undefined ||
      ulbId === null ||
      ulbId === ""
    ) {
      console.error(
        "Validation Error: Missing required parameters in request body (appliId or ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters in request body: appliId and ulbId are mandatory.",
      });
    }

    // --- CRITICAL FIX: Define parsedAppliId and parsedUlbId here ---
    // Parse parameters to integers and validate type
    const parsedAppliId = parseInt(appliId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    // Validate if the parsed values are numbers
    if (isNaN(parsedAppliId)) {
      console.error(
        `Validation Error: Invalid input. appliId: ${appliId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for appliId: ${appliId}. Expected a number.`,
      });
    }

    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }
    // --- END CRITICAL FIX ---

    console.log("Attempting to get database connection...");
    connection = await getConnection();
    console.log("Successfully got database connection.");

    // 3. Define the SQL Query
    // The query uses LISTAGG to aggregate trade types into a single comma-separated string
    // Bind parameters are used to prevent SQL injection and ensure proper data typing
    // --- FIX: Changed 'var_rate_tradetypename' to 'num_rate_tradetypename' as per your original SQL ---
    const sqlQuery = `
      SELECT
        atd.num_applitradetype_appliid AS appli_id,
        (LISTAGG(atm.num_rate_tradetypename, ',') WITHIN GROUP (ORDER BY atm.num_rate_tradetypename)) AS trade_types
      FROM
        aomk_applitradetyp_det atd
      INNER JOIN
        aomk_rate_mas atm ON atm.num_rate_id = atd.num_applitradetype_trdtypid
      WHERE
        atd.num_applitradetype_appliid = :appliId
        AND atd.num_applitradetyp_ulbid = :ulbId
      GROUP BY
        atd.num_applitradetype_appliid
    `;

    // 4. Define Bind Parameters
    // parsedAppliId and parsedUlbId are now correctly defined here
    const binds = {
      appliId: { val: parsedAppliId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    console.log("Executing SQL query...");
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });
    console.log("SQL query executed successfully.");

    // 5. Send the Response
    res.status(200).json({
      success: true,
      data: result.rows, // This will be an array of objects
    });
  } catch (error) {
    // 6. Error Handling
    console.error("Error in getApplicantTradeTypes:", error);

    if (!res.headersSent) {
      const clientError = {
        message:
          error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        // Node.js oracledb error code
        clientError.code = error.code;
      }
      if (error.errorNum) {
        // Oracle database error number
        clientError.oracleErrorNum = error.errorNum;
      }
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching applicant trade types.",
        error: clientError,
      });
    }
  }
};

module.exports = getApplicantTradeTypes;
