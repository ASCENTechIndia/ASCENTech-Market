const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

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
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
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

module.exports = getUsers;
