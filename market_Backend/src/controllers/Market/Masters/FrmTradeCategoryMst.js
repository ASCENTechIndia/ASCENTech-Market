// controllers/tradeCategoryByIdPostController.js
const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path if necessary

const FrmTradeCategoryMst = async (req, res) => {
  let connection;
  try {
    // Get parameters from request body (payload)
    const in_tradeCategoryId = req.body.TradeCategoryId;
    const in_orgid = req.body.OrgId;

    // --- Validation ---
    if (
      in_tradeCategoryId === undefined ||
      in_tradeCategoryId === null ||
      isNaN(in_tradeCategoryId)
    ) {
      return res.status(400).json({
        errorCode: -201, // Custom error code
        message:
          "Parameter TradeCategoryId is required in the request body and must be a valid number.",
      });
    }
    if (in_orgid === undefined || in_orgid === null || isNaN(in_orgid)) {
      return res.status(400).json({
        errorCode: -200, // Reusing existing error code for OrgId
        message:
          "Parameter OrgId is required in the request body and must be a valid number.",
      });
    }

    connection = await getConnection();

    // SQL query remains the same as the logic is identical, only input source changes
    const sql = `
            SELECT
                num_tradecategory_id,
                var_tradecategory_name,
                var_tradecategory_flag
            FROM
                aomk_TradeCategory_mas
            WHERE
                num_tradecategory_id = :in_tradeCategoryId
                AND num_tradecategory_ulbid = :in_orgid
        `;

    const result = await connection.execute(
      sql,
      {
        in_tradeCategoryId: parseInt(in_tradeCategoryId, 10),
        in_orgid: parseInt(in_orgid, 10),
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return results as array of objects
    );

    // If no row found, return 404 Not Found or a specific success with empty data
    if (result.rows.length === 0) {
      return res.status(404).json({
        // 404 is appropriate for "resource not found"
        errorCode: -202, // Custom error code for Not Found
        message: "Trade category not found for the given IDs.",
      });
    }

    // Send the single fetched record
    res.status(200).json({
      errorCode: 9999, // Success code
      message: "Trade category fetched successfully.",
      data: result.rows[0], // Return the first (and only) row
    });
  } catch (err) {
    console.error("Error fetching trade category by ID (POST):", err);
    let errorLineNo = "";
    if (err.stack) {
      const stackLines = err.stack.split("\n");
      const errorLine = stackLines.find((line) =>
        line.includes("at FrmTradeCategoryMstPost")
      );
      if (errorLine) {
        const match = errorLine.match(/:(\d+):\d+\)$/);
        if (match && match[1]) {
          errorLineNo = match[1];
        }
      }
    }

    // Log error to Admins.Aoma_Error_Log_Ins
    let logOrgId = req.body.OrgId || null; // Get from body for POST
    let logUserId = req.body.UserId || "API_USER_POST_RETRIEVAL"; // Default or get from session/token

    if (connection) {
      try {
        // Ensure error logging is committed
        await connection.execute(
          `BEGIN Admins.Aoma_Error_Log_Ins(:orgid, :userid, 'FrmTradeCategoryMstPost_Node', :errorcode, :sqlcode, :sqlerrm, :errordetails); END;`,
          {
            orgid: logOrgId,
            userid: logUserId,
            errorcode: -110, // General 'Unsuccess'
            sqlcode: err.errorNum || -1,
            sqlerrm: (err.message || "Unknown error").substring(0, 200),
            errordetails: `Errorline No:${errorLineNo}`,
          }
        );
        await connection.commit();
      } catch (logErr) {
        console.error(
          "Error during error logging in FrmTradeCategoryMstPost:",
          logErr
        );
      }
    }

    res.status(500).json({
      errorCode: -110,
      message: "Failed to retrieve trade category.",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection in FrmTradeCategoryMstPost:",
          err
        );
      }
    }
  }
};

const FrmTradeCategoryList = async (req, res) => {
  let connection;
  try {
    const in_orgid = req.body.OrgId;

    // --- Validation ---
    if (!in_orgid || isNaN(in_orgid)) {
      return res.status(400).json({
        errorCode: -200, // Custom error code for missing/invalid OrgId
        message:
          "Parameter OrgId is required in the request body and must be a valid number.",
      });
    }

    connection = await getConnection();

    // SQL query remains the same as it's purely a SELECT operation
    const sql = `
            SELECT
                num_tradecategory_id,
                var_tradecategory_name,
                CASE var_tradecategory_flag
                    WHEN 'Y' THEN 'Active'
                    WHEN 'N' THEN 'Inactive'
                    ELSE var_tradecategory_flag -- Handle other potential values gracefully
                END AS var_tradecategory_flag
            FROM
                aomk_TradeCategory_mas
            WHERE
                num_tradecategory_ulbid = :in_orgid
        `;

    const result = await connection.execute(
      sql,
      { in_orgid: parseInt(in_orgid, 10) }, // Ensure OrgId is bound as a number
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return results as array of objects
    );

    // If no rows found, return a specific message or empty array
    if (result.rows.length === 0) {
      return res.status(200).json({
        errorCode: 0, // Or a specific code for "no data found" if you prefer
        message: "No trade categories found for the given Organization ID.",
        data: [],
      });
    }

    // Send the fetched data
    res.status(200).json({
      errorCode: 9999, // Success code
      message: "Trade categories fetched successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching trade categories by POST:", err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(
          "Error closing connection in getTradeCategoriesByPost:",
          err
        );
      }
    }
  }
};

const Aomk_TradeCategory_Ins = async (req, res) => {
  let connection;

  try {
    const {
      In_Userid,
      In_Mode,
      In_TradeCategoryid,
      In_TradeCategoryname,
      In_TradeCategoryflag,
      In_orgid,
      in_ipaddr,
      in_source,
      in_code,
    } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        Aomk_TradeCategory_Ins(
          :In_Userid,
          :In_Mode,
          :In_TradeCategoryid,
          :In_TradeCategoryname,
          :In_TradeCategoryflag,
          :In_orgid,
          :in_ipaddr,
          :in_source,
          :in_code,
          :Out_Errorcode,
          :Out_Errormsg
        );
      END;
      `,
      {
        In_Userid,
        In_Mode,
        In_TradeCategoryid,
        In_TradeCategoryname,
        In_TradeCategoryflag,
        In_orgid,
        in_ipaddr,
        in_source,
        in_code,
        Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_Errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
      }
    );

    // Return PL/SQL output parameters
    const response = {
      success: result.outBinds.Out_Errorcode === 9999,
      ErrorCode: result.outBinds.Out_Errorcode,
      Message: result.outBinds.Out_Errormsg,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error executing Trade Category Procedure:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing DB connection:", err);
      }
    }
  }
};
module.exports = { FrmTradeCategoryMst, FrmTradeCategoryList, Aomk_TradeCategory_Ins };
