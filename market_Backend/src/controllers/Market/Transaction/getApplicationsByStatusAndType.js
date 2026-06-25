const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getApplicationsByStatusAndType = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, userId } = req.body;

    if (!ulbId) {
      console.error("Validation Error: Missing required parameter: ulbId.");
      return res.status(400).json({ success: false, message: "ULB ID is mandatory." });
    }
    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({ success: false, message: `Invalid format for ulbId: ${ulbId}. Expected a number.` });
    }

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error("Validation Error: Missing or invalid userId.");
      return res.status(400).json({ success: false, message: "User ID is mandatory and must be a non-empty string." });
    }
    const trimmedUserId = userId.trim();

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        apm.num_appli_id AS applicationid,
        apm.var_appli_applino AS applicationno,
        apm.var_appli_placeownername AS appliname,
        apm.var_appli_address AS address,
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        apm.var_appli_shopname AS shopname,
        apm.var_appli_applidt AS applicationdate
      FROM
        aomk_appli_mas apm
      INNER JOIN
        prop.vw_zonemas zm ON zm.zoneid = apm.num_appli_zoneid AND zm.wardid = apm.num_appli_wardid
      WHERE
        1=1
        AND apm.var_appli_appstatus IN ('V','AV')
        AND apm.num_appli_ulbid = :ulbId
        AND ( (apm.var_appli_type = 'N' AND apm.var_appli_adtpstatus = 'ADTPA') OR (apm.var_appli_type = 'R' AND apm.var_appli_adtpstatus IS NULL))
        AND apm.var_appli_sdstatus IS NULL
        AND apm.var_appli_papernotice IS NULL
        AND apm.num_appli_wardid IN (
          SELECT num_warduser_wardid FROM aomk_warduser_config
          WHERE num_warduser_userid = :userId AND num_warduser_ulbid = :ulbIdSubquery
        )
      ORDER BY
        apm.num_appli_id DESC
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      userId: { val: trimmedUserId, type: oracledb.STRING },
      ulbIdSubquery: { val: parsedUlbId, type: oracledb.NUMBER } 
    };


    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching applications by status and type:", error);
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
        message: "Internal Server Error during fetching applications by status and type.",
        error: clientError,
      });
    }
  } 
};

module.exports = getApplicationsByStatusAndType;
