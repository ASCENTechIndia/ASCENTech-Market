const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const [day, month, year] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const FrmErrorLogRpt = async (req, res) => {
  let connection;

  try {
    const { ulbId, departmentId, fromDate, toDate, userId } = req.body;

    if (
      !ulbId ||
      !departmentId ||
      !fromDate ||
      !toDate ||
      userId === undefined ||
      userId === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: ulbId, departmentId, fromDate, toDate, and userId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    const parsedDepartmentId = parseInt(departmentId, 10);
    const trimmedFromDate = fromDate.trim();
    const trimmedToDate = toDate.trim();
    const trimmedUserId = userId.trim();

    if (isNaN(parsedUlbId) || isNaN(parsedDepartmentId)) {
      return res.status(400).json({
        success: false,
        message: "ulbId and departmentId must be valid numbers.",
      });
    }

    if (
      !isValidDateDDMMYYYY(trimmedFromDate) ||
      !isValidDateDDMMYYYY(trimmedToDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "Dates must be in 'DD-MM-YYYY' format and valid.",
      });
    }

    if (typeof trimmedUserId !== "string" || trimmedUserId === "") {
      return res.status(400).json({
        success: false,
        message: "userId must be a non-empty string (or '0' for all users).",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        ROWNUM AS row_num,
        ael.var_error_userid AS userid,
        ael.date_error_usertime AS usertime,
        ael.var_error_objectname AS objectname,
        ael.var_error_code AS error_code,
        ael.var_error_errorcode AS errorcode,
        ael.var_error_errortext AS errortext
      FROM
        ADMINS.aoma_error_log ael
      INNER JOIN
        ADMINS.aoma_user_def aud ON ael.var_error_userid = aud.num_user_userid
        AND ael.num_error_ulbid = aud.num_user_ulbid
      WHERE
        ael.num_error_ulbid = :ulbId
        AND aud.num_user_deptid = :departmentId
        AND TRUNC(ael.date_error_usertime) BETWEEN TO_DATE(:fromDate, 'DD-MM-YYYY') AND TO_DATE(:toDate, 'DD-MM-YYYY')
        AND (:userId = '0' OR ael.var_error_userid = :userId)
      ORDER BY
        ael.date_error_usertime DESC
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
    console.error("Error fetching error log:", error);
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

const getUsers = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, departmentId } = req.body;

    if (!ulbId) {
      console.error("Validation Error: Missing required parameter: ulbId.");
      return res
        .status(400)
        .json({ success: false, message: "ULB ID is mandatory." });
    }
    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    if (!departmentId) {
      console.error(
        "Validation Error: Missing required parameter: departmentId."
      );
      return res
        .status(400)
        .json({ success: false, message: "Department ID is mandatory." });
    }
    const parsedDepartmentId = parseInt(departmentId, 10);
    if (isNaN(parsedDepartmentId)) {
      console.error(
        `Validation Error: Invalid departmentId: ${departmentId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for departmentId: ${departmentId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        var_user_username AS username,
        num_user_userid AS userId
      FROM
        ADMINS.aoma_user_def
      WHERE
        num_user_ulbid = :ulbId
        AND num_user_deptid = :departmentId -- FIX: Added departmentId to the WHERE clause
      ORDER BY
        var_user_username -- Order by username for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      departmentId: { val: parsedDepartmentId, type: oracledb.NUMBER }, // departmentId is now a dynamic bind variable
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching department users:", error);
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
        message: "Internal Server Error during fetching department users.",
        error: clientError,
      });
    }
  }
};
module.exports = { FrmErrorLogRpt, getUsers };
