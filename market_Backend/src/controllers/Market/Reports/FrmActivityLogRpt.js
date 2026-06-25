const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

// Reuse same date validator
const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;
  const [day, month, year] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const FrmActivityLogRpt = async (req, res) => {
  let connection;

  try {
    const { ulbId, departmentId, fromDate, toDate, userId } = req.body;

    // Validate required inputs
    if (!ulbId || !departmentId || !fromDate || !toDate || userId === undefined || userId === null) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: ulbId, departmentId, fromDate, toDate, and userId.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    const parsedDepartmentId = parseInt(departmentId, 10);
    const trimmedFromDate = fromDate.trim();
    const trimmedToDate = toDate.trim();
    const trimmedUserId = userId.trim();

    if (isNaN(parsedUlbId) || isNaN(parsedDepartmentId)) {
      return res.status(400).json({ success: false, message: "ulbId and departmentId must be numbers." });
    }

    if (!isValidDateDDMMYYYY(trimmedFromDate) || !isValidDateDDMMYYYY(trimmedToDate)) {
      return res.status(400).json({ success: false, message: "fromDate and toDate must be in DD-MM-YYYY format." });
    }

    if (typeof trimmedUserId !== "string" || trimmedUserId === "") {
      return res.status(400).json({ success: false, message: "userId must be a non-empty string ('-1' for all users)." });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT 
        ROWNUM AS row_num,
        aal.var_activity_userid AS userid,
        aud.var_user_username AS username,
        aal.dat_activity_usertime AS usertime,
        aal.var_activity_pagetitle AS pagetitle,
        aal.var_activity_activity AS activity,
        aal.var_activity_details AS details
      FROM 
        ADMINS.aoma_activity_log aal
      JOIN 
        ADMINS.aoma_user_def aud 
        ON aal.var_activity_userid = aud.num_user_userid 
        AND aal.num_activity_ulbid = aud.num_user_ulbid
      WHERE 
        aal.num_activity_ulbid = :ulbId
        AND aud.num_user_deptid = :departmentId
        AND (:userId = '-1' OR aal.var_activity_userid = :userId)
        AND TRUNC(aal.dat_activity_usertime) 
            BETWEEN TO_DATE(:fromDate, 'DD-MM-YYYY') 
            AND TO_DATE(:toDate, 'DD-MM-YYYY')
      ORDER BY 
        aal.dat_activity_usertime DESC
    `;

    const binds = {
      ulbId: parsedUlbId,
      departmentId: parsedDepartmentId,
      fromDate: trimmedFromDate,
      toDate: trimmedToDate,
      userId: trimmedUserId,
    };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching activity log:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: {
        message: error.message,
        code: error.code,
        oracleErrorNum: error.errorNum,
      },
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB connection closed.");
      } catch (closeError) {
        console.error("Error closing DB connection:", closeError);
      }
    }
  }
};

module.exports = FrmActivityLogRpt;
