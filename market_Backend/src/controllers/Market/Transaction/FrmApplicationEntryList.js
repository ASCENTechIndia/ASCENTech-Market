const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmApplicationEntryList = async (req, res) => {
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
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        app.num_appli_id AS applicationid,
        app.var_appli_applino AS applicationno,
        app.var_appli_applidt AS applicationdate,
        app.var_appli_shopname AS shopname,
        app.num_appli_busstartyr AS businessyear,
        app.var_appli_panno AS panno,
        app.num_appli_contactno AS contactno,
        app.var_appli_email AS email,
        app.var_appli_address AS address
      FROM
        aomk_appli_mas app
      INNER JOIN
        prop.vw_zonemas zm ON zm.zoneid = app.num_appli_zoneid AND zm.wardid = app.num_appli_wardid
      WHERE
        app.var_appli_appstatus IS NULL
        AND app.num_appli_ulbid = :ulbId
        AND app.num_appli_serviceid IS NULL
      ORDER BY
        app.var_appli_applino DESC
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
    console.error("Error fetching application details:", error);
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
      // Simplified error response as per your request
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching application details.",
        error: clientError,
      });
    }
  } 
};

module.exports = FrmApplicationEntryList;
