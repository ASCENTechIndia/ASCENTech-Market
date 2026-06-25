const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getShopTypeByAppAndOrgId = async (req, res) => {
  let connection;
  let result;

  try {
    const { appId, orgId } = req.body;

    if (!appId || !orgId) {
      console.error("Validation Error: Missing required parameters in request body (appId, orgId).");
      return res.status(400).json({ success: false, message: "appId and orgId are mandatory." });
    }

    const parsedAppId = parseInt(appId, 10);
    if (isNaN(parsedAppId)) {
      console.error(`Validation Error: Invalid appId: ${appId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for appId: ${appId}. Expected a number.` });
    }

    const parsedOrgId = parseInt(orgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(`Validation Error: Invalid orgId: ${orgId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for orgId: ${orgId}. Expected a number.` });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        arm.num_rate_tradetypename AS shoptype
      FROM
        aomk_mktlice_mas mkt
      INNER JOIN
        aomk_appli_mas app ON app.num_appli_id = mkt.num_mktlice_appliid
      INNER JOIN
        aomk_applitradetyp_det atd ON atd.num_applitradetype_appliid = mkt.num_mktlice_appliid
      INNER JOIN
        aomk_rate_mas arm ON arm.num_rate_id = atd.num_applitradetype_trdtypid
      WHERE
        app.num_appli_id = :appId
        AND mkt.num_mktlice_ulbid = :orgId
      ORDER BY
        arm.num_rate_tradetypename -- Order by shoptype for consistent results
    `;

    const binds = {
      appId: { val: parsedAppId, type: oracledb.NUMBER },
      orgId: { val: parsedOrgId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(`No shop type details found for App ID: ${appId}, Org ID: ${orgId}`);
      return res.status(404).json({
        success: false,
        message: "No shop type details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching shop type details:", error);
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
        message: "Internal Server Error during fetching shop type details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getShopTypeByAppAndOrgId;
