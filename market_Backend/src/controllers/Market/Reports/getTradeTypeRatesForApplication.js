const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getTradeTypeRatesForApplication = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId, appId } = req.body;

    if (!ulbId || !appId) {
      console.error(
        "Validation Error: Missing required parameters in request body (ulbId, appId)."
      );
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: ulbId and appId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    const parsedAppId = parseInt(appId, 10);

    if (isNaN(parsedUlbId) || isNaN(parsedAppId)) {
      console.error(
        `Validation Error: Invalid input. ulbId: ${ulbId}, appId: ${appId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message: "Invalid format for ulbId or appId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        attd.num_applitradetype_trdtypid AS tradetypeid,
        arm.num_rate_tradetypename AS tradetype,
        NVL(attd.num_applitrade_traderate, 0) AS tradtype_rate
      FROM
        aomk_applitradetyp_det attd
      INNER JOIN
        aomk_rate_mas arm ON attd.num_applitradetype_trdtypid = arm.num_rate_id
      WHERE
        attd.num_applitradetyp_ulbid = :ulbId
        AND attd.num_applitradetype_appliid = :appId
      ORDER BY
        attd.num_applitradetype_trdtypid -- Order for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      appId: { val: parsedAppId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching trade type rates for application:", error);
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
          "Internal Server Error during fetching trade type rates for application.",
        error: clientError,
      });
    }
  }
};

module.exports = getTradeTypeRatesForApplication;
