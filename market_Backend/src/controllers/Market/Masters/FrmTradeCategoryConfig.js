const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const FrmTradeCategoryConfig = async (req, res) => {
  let connection;
  let result;

  try {
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
        tcm.num_tradecategory_id AS tradeCatId,
        tcm.var_tradecategory_name AS tradeCatName,
        tccm.var_tradecatconf_flag AS configFlag -- Added configFlag for clarity based on ORDER BY
      FROM
        aomk_tradecategory_mas tcm
      LEFT JOIN
        aomk_tradecatconfig_mas tccm ON tccm.num_tradecatconf_tradecatid = tcm.num_tradecategory_id
        AND tccm.num_tradecatconf_ulbid = :ulbId -- ULB ID filter in LEFT JOIN condition
      ORDER BY
        tccm.var_tradecatconf_flag -- Order by config flag as requested
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });


    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching trade categories:", error);
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
        message: "Internal Server Error during fetching trade categories.",
        error: clientError,
      });
    }
  }
};

module.exports = FrmTradeCategoryConfig;
