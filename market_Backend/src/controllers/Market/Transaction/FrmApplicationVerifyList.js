const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmApplicationVerifyList = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, userId } = req.body;

    if (!ulbId || !userId) {
      return res.status(400).json({
        success: false,
        message: "ulbId and userId are required",
      });
    }

    const parsedUlbId = Number(ulbId);
    if (isNaN(parsedUlbId)) {
      return res.status(400).json({
        success: false,
        message: "ulbId must be a number",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT 
        app.num_appli_id AS applicationid,
        app.var_appli_applino AS applicationno,
        app.var_appli_placeownername AS appliname,
        app.var_appli_address AS address,
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        app.var_appli_shopname AS shopname,
        app.var_appli_applidt AS applicationdate
      FROM 
        aomk_appli_mas app
      INNER JOIN 
        prop.vw_zonemas zm 
        ON zm.zoneid = app.num_appli_zoneid 
        AND zm.wardid = app.num_appli_wardid
      WHERE 
        app.var_appli_appstatus IN ('V', 'AV')
        AND app.num_appli_ulbid = :ulbId
        AND (
          (app.var_appli_type = 'N' AND app.var_appli_adtpstatus = 'ADTPA')
          OR (app.var_appli_type = 'R' AND app.var_appli_adtpstatus IS NULL)
        )
        AND app.var_appli_sdstatus IS NULL
        AND app.var_appli_papernotice IS NULL
        AND app.var_appli_flowtype = 'C'
        AND app.num_appli_wardid IN (
          SELECT num_warduser_wardid 
          FROM aomk_warduser_config
          WHERE UPPER(num_warduser_userid) = UPPER(:userId)
          AND num_warduser_ulbid = :ulbId
        )
      ORDER BY app.num_appli_id DESC
    `;

    const binds = {
      ulbId: parsedUlbId,
      userId, // stays string
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close().catch(() => {});
  }
};


const FrmSDItemsList = async (req, res) => {
  let connection;
  let result;

  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT 
        num_sditems_id AS itemid,
        var_sditems_name AS item
      FROM 
        aomk_sditems_mas
      ORDER BY 
        num_sditems_id ASC
    `;

    result = await connection.execute(
      sqlQuery,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching SD items list:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error while fetching SD items list.",
        error: {
          message: error.message || "Unexpected internal error.",
          code: error.code || null,
          oracleErrorNum: error.errorNum || null,
        },
      });
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
};

const FrmApplicationDetailsById = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { AppliId, ulbId } = req.body;

    if (!AppliId || !ulbId) {
      console.error(
        "Validation Error: Missing required parameters in request body (AppliId or ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters in request body: AppliId and ulbId are mandatory.",
      });
    }

    const parsedAppId = parseInt(AppliId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedAppId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. AppliList_AppId=${AppliId}, ulbId=${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid input format: AppliList_AppId and ulbId must be numeric.`,
      });
    }

    // 2. Establish Database Connection
    connection = await getConnection();

    // 3. SQL Query
    const sqlQuery = `
      SELECT 
        app.var_appli_applino,
        app.var_appli_applidt,
        app.var_appli_oldlicencno,
        app.var_appli_shopname,
        app.var_appli_panno,
        app.num_appli_contactno,
        app.var_appli_email,
        app.var_appli_address,
        app.num_appli_zoneid,
        app.num_appli_wardid,
        zm.zonename,
        zm.wardname,
        app.var_appli_isprod,
        app.var_appli_ownspace,
        app.var_appli_agrmentwith,
        app.num_appli_area,
        app.var_appli_iscorpnoc,
        app.num_appli_busstartyr,
        app.var_appli_shopactno,
        app.var_appli_foodlicno,
        app.num_appli_licdays,
        app.var_appli_shopnamemar,
        app.var_appli_placeownername,
        app.var_appli_placeowneraddress,
        app.dat_appli_fromdt,
        app.dat_appli_todt,
        NVL(app.num_appli_amount, 0) AS amount,
        NVL(app.num_appli_arreasamt, 0) AS arreasamt
      FROM 
        aomk_appli_mas app
      INNER JOIN 
        prop.vw_zonemas zm 
        ON zm.zoneid = app.num_appli_zoneid 
        AND zm.wardid = app.num_appli_wardid 
        AND zm.ulbid = app.num_appli_ulbid
      WHERE 
        app.num_appli_id = :AppliList_AppId
        AND app.num_appli_ulbid = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      AppliList_AppId: { val: parsedAppId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    // 6. Send Response
    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching application details by ID:", error);
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
          "Internal Server Error during fetching application details by ID.",
        error: clientError,
      });
    }
  } finally {
    // 7. Close Database Connection
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing the database connection:", closeError);
      }
    }
  }
};

const GetApplicationTradeType = async (req, res) => {
  let connection;
  try {
    const { AppliList_AppId, OrgId } = req.body;

    // Validation
    if (!AppliList_AppId || !OrgId) {
      return res.status(400).json({
        success: false,
        message: "AppliList_AppId and OrgId are required.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT 
        num_applitradetype_id, 
        num_applitradetype_appliid, 
        num_applitradetype_trdtypid, 
        NVL(num_applitrade_traderate, 0) AS Rate,
        num_rate_tradetypename AS tradetype, 
        num_rate_id AS tradetypeid 
      FROM aomk_applitradetyp_det  
      INNER JOIN aomk_rate_mas 
      ON num_rate_id = num_applitradetype_trdtypid 
      AND num_rate_ulbid = num_applitradetyp_ulbid  
      WHERE num_applitradetype_appliid = :AppliList_AppId 
      AND num_applitradetyp_ulbid = :OrgId
    `;

    const result = await connection.execute(
      sqlQuery,
      { AppliList_AppId, OrgId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      message: "Application Trade Type details fetched successfully.",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching Application Trade Type details:", error);
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
        console.error("Error closing connection:", err);
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

const getTradeList = async (req, res) => {
  const { ulbId } = req.body; // read from POST body

  if (!ulbId) {
    return res.status(400).json({
      success: false,
      message: "ulbId is required in request body",
    });
  }

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `SELECT 
          num_trade_id AS tradeid,
          var_trade_name AS tradename,
          'N' AS flag
       FROM 
          aomk_trade_mas
       WHERE 
          var_trade_flag = 'Y'
          AND num_trade_ulbid = :ulbId`,
      { ulbId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    await connection.close();

    return res.status(200).json({
      success: true,
      message: "Trade list fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching trade list:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const postAdtpItems = async (req, res) => {
  let connection;
  try {
    const { ulbId } = req.body; // reserved for future use

    connection = await getConnection();

    const query = `
      SELECT 
        num_adtpitems_id AS itemid, 
        var_adtpitems_name AS item
      FROM 
        aomk_adtpitems_mas
    `;

    const result = await connection.execute(query, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

    const data = result.rows.map((row) => ({
      itemid: row.ITEMID,
      item: row.ITEM,
    }));

    return res.status(200).json({
      success: true,
      message: "ADTP Items fetched successfully",
      data,
    });

  } catch (error) {
    console.error("❌ Error fetching ADTP items:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("⚠️ Error closing DB connection:", closeErr);
      }
    }
  }
};


const insertApplicationVerify = async (req, res) => {
  const {
    In_UserId,
    In_Appid,
    In_OrgId,
    In_Feedback,
    In_Str,
    In_Mode,
    In_Status,
    in_ipaddr,
    In_Source,
  } = req.body;

  try {
    const connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        aomk_applicationverify_ins(
          :In_UserId,
          :In_Appid,
          :In_OrgId,
          :In_Feedback,
          :In_Str,
          :In_Mode,
          :In_Status,
          :in_ipaddr,
          :In_Source,
          :Out_Errorcode,
          :Out_Errormsg,
          :Out_status
        );
      END;
      `,
      {
        In_UserId: {
          val: In_UserId,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        In_Appid: {
          val: In_Appid,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        In_OrgId: {
          val: In_OrgId,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        In_Feedback: {
          val: In_Feedback,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        In_Str: { val: In_Str, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_Mode: { val: In_Mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_Status: {
          val: In_Status,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        in_ipaddr: {
          val: in_ipaddr,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        In_Source: {
          val: In_Source,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_Errormsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 500,
        },
        Out_status: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 100,
        },
      }
    );

    const response = {
      success: result.outBinds.Out_Errorcode === 9999,
      errorCode: result.outBinds.Out_Errorcode,
      message: result.outBinds.Out_Errormsg,
      status: result.outBinds.Out_status,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error executing aomk_applicationverify_ins:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getTradeRateTypes = async (req, res) => {
  const { ulbId, tradeCategoryId, tradeTypeId } = req.body;

  if (!ulbId || !tradeCategoryId || !tradeTypeId) {
    return res.status(400).json({
      success: false,
      message: "ulbId, tradeCategoryId, and tradeTypeId are required",
    });
  }

  let connection;
  try {
    connection = await getConnection();

    const query = `
      SELECT 
        num_rate_tradetypename AS tradetype,
        num_rate_id AS tradetypeid,
        0 AS rate,
        'N' AS flag
      FROM aomk_tradetype_mas
      INNER JOIN aomk_tradecategory_mas 
        ON aomk_tradetype_tradecategoryid = num_tradecategory_id 
        AND aomk_tradetype_ulbid = num_tradecategory_ulbid
      INNER JOIN aomk_rate_mas 
        ON num_rate_tradetypeid = num_tradetype_id 
        AND num_rate_ulbid = aomk_tradetype_ulbid
      WHERE 
        var_tradetype_flag = 'Y'
        AND aomk_tradetype_ulbid = :ulbId
        AND num_tradecategory_id = :tradeCategoryId
        AND num_tradetype_id = :tradeTypeId
    `;

    const result = await connection.execute(
      query,
      { ulbId, tradeCategoryId, tradeTypeId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      message: "Trade rate types fetched successfully",
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching trade rate types:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = {
  FrmApplicationVerifyList,
  FrmSDItemsList,
  FrmApplicationDetailsById,
  GetApplicationTradeType,
  FrmTradeCategoryList,
  getTradeList,
  postAdtpItems,
  insertApplicationVerify,
  getTradeRateTypes,
};
