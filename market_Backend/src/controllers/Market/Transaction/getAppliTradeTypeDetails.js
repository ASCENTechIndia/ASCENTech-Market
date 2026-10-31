const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getAppliTradeTypeDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (applicationId, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters in request body: applicationId and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. applicationId: ${applicationId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for applicationId or ulbId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        attd.num_applitradetype_id AS appliTradeTypeId,
        attd.num_applitradetype_appliid AS appliId,
        attd.num_applitradetype_trdtypid AS tradeTypeId,
        NVL(attd.num_applitrade_traderate, 0) AS rate,
        arm.num_rate_tradetypename AS tradeTypeName,
        arm.num_rate_id AS tradeTypeIdFromRateMas
      FROM
        aomk_applitradetyp_det attd
      INNER JOIN
        aomk_rate_mas arm ON arm.num_rate_id = attd.num_applitradetype_trdtypid
        AND arm.num_rate_ulbid = attd.num_applitradetyp_ulbid
      WHERE
        attd.num_applitradetype_appliid = :applicationId
        AND attd.num_applitradetyp_ulbid = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
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
    console.error("Error fetching application trade type details:", error);
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
        message: "Internal Server Error during fetching application trade type details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getAppliTradeTypeDetails;
