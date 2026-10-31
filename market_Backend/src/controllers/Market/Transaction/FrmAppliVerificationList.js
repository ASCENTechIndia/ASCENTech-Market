const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmAppliVerificationList = async (req, res) => {
  let connection; // Declare connection variable to ensure it's accessible in the finally block

  try {
    const { ulbId } = req.body; // Now accepting ulbId from the request body

    if (!ulbId) {
      console.error("Validation Error: Missing required parameter in request body (ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: ulbId is mandatory.",
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
        zonename AS zonename,
        wardname AS wardname,
        num_appli_id AS applicationid,
        var_appli_applino AS applicationno,
        var_appli_applidt AS applicationdate,
        var_appli_shopname AS shopname,
        num_appli_busstartyr AS businessyear,
        var_appli_panno AS panno,
        num_appli_contactno AS contactno,
        var_appli_email AS email,
        var_appli_address AS address
      FROM
        aomk_appli_mas am
      INNER JOIN
        prop.vw_zonemas vz ON vz.zoneid = am.num_appli_zoneid AND vz.wardid = am.num_appli_wardid
      WHERE
        am.var_appli_appstatus IS NULL
        AND am.num_appli_ulbid = :ulbId -- Using bind variable for ULB ID
        AND (
              (am.var_appli_source = 'ONLINE' AND am.num_appli_onlcharges IS NOT NULL)
              OR (am.var_appli_source IN ('DEPT', 'RTS', NULL) OR am.var_appli_source IS NULL)
            )
      ORDER BY
        am.num_appli_id DESC
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER }, // Pass the parsed ULB ID
    };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return rows as JavaScript objects
    });

    // 6. Send the Results as JSON Response
    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    // 7. Centralized Error Handling
    console.error("Error fetching pending applications:", error);

    if (!res.headersSent) {
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.",
      };
      if (typeof error.code === 'string' || typeof error.code === 'number') {
        clientError.code = error.code;
      }
      if (typeof error.errorNum === 'number') {
        clientError.oracleErrorNum = error.errorNum;
      }

      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching pending applications.",
        error: clientError,
      });
    }
  } 
};

module.exports = FrmAppliVerificationList;