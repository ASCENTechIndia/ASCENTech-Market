const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getConfiguredTradeCategories = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId } = req.body;

    if (!ulbId) {
      console.error(
        "Validation Error: Missing required parameter in request body (ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameter in request body: ulbId is mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        tcm.num_tradecategory_id AS tradeCatId,
        tcm.var_tradecategory_name AS tradeCatName
      FROM
        aomk_tradecategory_mas tcm
      INNER JOIN
        aomk_tradecatconfig_mas tccm ON tccm.num_tradecatconf_tradecatid = tcm.num_tradecategory_id
      WHERE
        tccm.var_tradecatconf_flag = 'Y'
        AND tccm.num_tradecatconf_ulbid = :ulbId
      ORDER BY
        tcm.var_tradecategory_name -- Order by trade category name for consistent results
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
    console.error("Error fetching configured trade categories:", error);
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
        message:
          "Internal Server Error during fetching configured trade categories.",
        error: clientError,
      });
    }
  }
};

const aomk_TradeCategoryconfig_ins = async (req, res) => {
  let connection;

  try {
    const { in_UserId, in_Orgid, in_str, in_Mode, in_ipaddress, in_source } =
      req.body;

    // Validation
    if (!in_UserId || typeof in_UserId !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid 'in_UserId'" });
    }

    if (!in_Orgid || isNaN(Number(in_Orgid))) {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid 'in_Orgid'" });
    }

    if (!in_str || typeof in_str !== "string" || in_str.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid 'in_str'" });
    }

    if (![1, 2].includes(Number(in_Mode))) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid 'in_Mode'. Must be 1 or 2.",
        });
    }

    if (!in_ipaddress || typeof in_ipaddress !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid 'in_ipaddress'" });
    }

    if (!in_source || typeof in_source !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "Missing or invalid 'in_source'" });
    }

    connection = await getConnection();

    // PL/SQL block using string interpolation (inputs not binded)
    const plsql = `
      DECLARE
        Out_Errorcode NUMBER;
        Out_Errormsg  VARCHAR2(500);
      BEGIN
        aomk_TradeCategoryconfig_ins(
          in_UserId      => '${in_UserId}',
          in_Orgid       => ${in_Orgid},
          in_str         => '${in_str.replace(/'/g, "''")}',
          in_Mode        => ${in_Mode},
          in_ipaddress   => '${in_ipaddress}',
          in_source      => '${in_source}',
          Out_Errorcode  => Out_Errorcode,
          Out_ErrorMsg   => Out_Errormsg
        );
        :out_errorcode := Out_Errorcode;
        :out_errormsg  := Out_Errormsg;
      END;
    `;

    const result = await connection.execute(plsql, {
      out_errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_errormsg: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 500,
      },
    });

    const outCode = result.outBinds.out_errorcode;
    const outMsg = result.outBinds.out_errormsg;

    if (outCode === 9999) {
      return res.status(200).json({
        success: true,
        message: outMsg,
        errorCode: outCode,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: outMsg,
        errorCode: outCode,
      });
    }
  } catch (error) {
    console.error("Error in aomk_TradeCategoryconfig_ins:", error);
    return res.status(500).json({
      success: false,
      message:
        "Internal server error during Trade Category Configuration processing.",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};
module.exports = { getConfiguredTradeCategories, aomk_TradeCategoryconfig_ins };
