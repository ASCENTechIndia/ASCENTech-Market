const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const BindApplicationDtlsForGenerateCerti = async (req, res) => {
  let connection; 
  let outErrorcode = 0;
  let outErrormsg = '';
  let errorlineno = 'N/A';

  try {
    const { In_OrgId } = req.body; 

    if (In_OrgId === null || typeof In_OrgId === 'undefined') {
      outErrorcode = -101;
      outErrormsg = 'Organization ID (In_OrgId) is missing or invalid.';
      return res.status(400).json({ success: false, errorcode: outErrorcode, errormsg: outErrormsg });
    }

    connection = await getConnection();

    await connection.execute('ALTER SESSION SET NLS_DATE_FORMAT = \'YYYY-MM-DD\'');
    console.log("Oracle session date format set.");

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
        var_appli_address AS address,
        var_appli_oldlicencno AS oldlicencno,
        var_appli_source AS source
      FROM
        aomk_appli_mas
      INNER JOIN
        prop.vw_zonemas ON vw_zonemas.zoneid = aomk_appli_mas.num_appli_zoneid
                        AND vw_zonemas.wardid = aomk_appli_mas.num_appli_wardid
      WHERE
        var_appli_appstatus = 'RC'
        AND var_appli_recno IS NOT NULL
        AND num_appli_ulbid = :In_OrgId
      ORDER BY
        num_appli_id DESC
    `;

    const bindVars = {
      In_OrgId: In_OrgId // Bind the organization ID from request body
    };

    console.log("Executing query for pending applications with In_OrgId:", In_OrgId);
    const result = await connection.execute(
      sqlQuery,
      bindVars,
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT // Return results as objects for easier access
      }
    );

    if (result.rows.length > 0) {
      res.status(200).json({
        applications: result.rows
      });
    } else {
      res.status(200).json({
        success: true,
        errorcode: 1000, // Custom code for no data found
        errormsg: 'No pending applications found.',
        applications: []
      });
    }

  } catch (error) {
    console.error("❌ Critical Error in get_pending_applications:", error);

    try {
      const stackLines = error.stack ? error.stack.split('\n') : [];
      const relevantStackLine = stackLines.find(line => line.includes('get_pending_applications.js') || (error.stack && error.stack.includes(__filename.split('/').pop())));
      if (relevantStackLine) {
        const match = relevantStackLine.match(/:(\d+):\d+\)?$/);
        if (match && match[1]) {
          errorlineno = match[1];
        }
      }
    } catch (e) {
      console.error("Error extracting error line number from stack:", e);
    }

    if (connection) {
      try {
        await connection.rollback();
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }

    const sqlCode = error.errorNum || (error.code && String(error.code).startsWith('ORA-') ? parseInt(String(error.code).replace('ORA-', ''), 10) : -9999);
    const sqlerrm = (error.message || 'Unknown error').substring(0, 200);

    if (connection) {
      try {
        await connection.execute(
          `BEGIN admins.aoma_error_log_ins(:orgId, :userId, 'Get_Pending_Applications', :outErrorcode, :sqlCode, :sqlerrm, :errorLineNo); END;`,
          {
            orgId: req.body.In_OrgId || null,
            userId: req.body.In_UserId || 'API_CALL', // Use In_UserId if available, otherwise a default
            outErrorcode: -110, // Generic error for API failure
            sqlCode: sqlCode,
            sqlerrm: sqlerrm,
            errorLineNo: 'Node Line:' + errorlineno
          },
          { autoCommit: true }
        );
        console.log("Error logged to aoma_error_log_ins successfully.");
      } catch (logError) {
        console.error("❌ Error logging to aoma_error_log_ins:", logError);
      }
    }

    // Send final error response to the client
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        errorcode: -110, // Generic error code for client
        errormsg: 'Failed to fetch pending applications.',
        rawError: error.message,
        oracleErrorNum: error.errorNum,
        oracleErrorCode: error.code,
      });
    }

  }
};

module.exports = BindApplicationDtlsForGenerateCerti;