const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmApplicationEntryMst = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      console.error(
        "Validation Error: Missing required parameters in request body (applicationId, ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: applicationId and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. applicationId: ${applicationId}, ulbId: ${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message:
          "Invalid format for applicationId or ulbId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        var_appli_applino AS applicationNo,
        var_appli_applidt AS applicationDate,
        var_appli_oldlicencno AS oldLicenseNo,
        var_appli_shopname AS shopName,
        var_appli_panno AS panNo,
        num_appli_contactno AS contactNo,
        var_appli_email AS email,
        var_appli_address AS address,
        num_appli_zoneid AS zoneId,
        num_appli_wardid AS wardId,
        var_appli_isprod AS isProd,
        var_appli_ownspace AS ownSpace,
        var_appli_agrmentwith AS agreementWith,
        num_appli_area AS area,
        var_appli_iscorpnoc AS isCorpNoc,
        num_appli_busstartyr AS businessStartYear,
        var_appli_shopactno AS shopActNo,
        var_appli_foodlicno AS foodLicNo,
        num_appli_licdays AS licenseDays,
        var_appli_shopnamemar AS shopNameMar,
        var_appli_placeownername AS placeOwnerName,
        var_appli_placeowneraddress AS placeOwnerAddress,
        dat_appli_fromdt AS fromDate,
        dat_appli_todt AS toDate,
        NVL(num_appli_amount, 0) AS amount,
        num_appli_licensetypeid AS licenseTypeId
      FROM
        aomk_appli_mas
      WHERE
        num_appli_id = :applicationId
        AND num_appli_UlbId = :ulbId
    `;

    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (result.rows.length === 0) {
      console.log(
        `No application details found for Application ID: ${applicationId}, ULB ID: ${ulbId}`
      );
      return res.status(404).json({
        success: false,
        message: "No application details found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows[0],
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
  }
};

const getLicenseTypes = async (req, res) => {
  let connection;
  let result;

  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        var_licensetype_name AS licenseTypeName,
        num_licensetype_id AS licenseTypeId
      FROM
        aomk_licensetype_mas
    `;

    result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching license types:", error);
    if (!res.headersSent) {
      // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching license types.",
        error: error.message,
      });
    }
  } finally {
    // 5. Close the Database Connection
    if (connection) {
      try {
        await connection.close();
        console.log("Database connection closed.");
      } catch (closeError) {
        console.error("Error closing database connection:", closeError);
      }
    }
  }
};

const getApplicationTradeDetailsByAppId = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      console.error(
        "Validation Error: Missing required parameter in request body (applicationId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameter in request body: applicationId is mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);

    if (isNaN(parsedApplicationId)) {
      console.error(
        `Validation Error: Invalid input. applicationId: ${applicationId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId: ${applicationId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_applitrade_id AS num_applitrade_id,
        num_applitrade_appliid AS num_applitrade_appliid,
        num_applitrade_tradeid AS num_applitrade_tradeid
      FROM
        aomk_applitrade_det
      WHERE
        num_applitrade_appliid = :applicationId
    `;

    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching application trade details:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
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
          "Internal Server Error during fetching application trade details.",
        error: clientError,
      });
    }
  }
};

const getWardName = async (req, res) => {
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
      SELECT DISTINCT
        wardname AS wardName,
        wardid AS wardId
      FROM
        prop.vw_zonemas
      WHERE
        ulbid = :ulbId
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
    console.error("Error fetching distinct ward names and IDs:", error);
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
          "Internal Server Error during fetching distinct ward names and IDs.",
        error: clientError,
      });
    }
  }
};

const getDistinctZones = async (req, res) => {
  let connection;
  let result;

  try {
    const { wardId, ulbId } = req.body;

    if (!wardId || !ulbId) {
      console.error(
        "Validation Error: Missing required parameters in request body (wardId, ulbId)."
      );
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: wardId and ulbId are mandatory.",
      });
    }

    const parsedWardId = parseInt(wardId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedWardId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. wardId: ${wardId}, ulbId: ${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message: "Invalid format for wardId or ulbId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT DISTINCT
        zonename AS zoneName,
        zoneid AS zoneId
      FROM
        prop.vw_zonemas
      WHERE
        wardid = :wardId
        AND ulbid = :ulbId
      ORDER BY
        zonename -- Order by zone name for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      wardId: { val: parsedWardId, type: oracledb.NUMBER },
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
    console.error("Error fetching distinct zones:", error);
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
        message: "Internal Server Error during fetching distinct zones.",
        error: clientError,
      });
    }
  }
};

const getTradeTypesByCategory = async (req, res) => {
  let connection;
  let result;

  try {
    const { tradeCategoryId, ulbId } = req.body;

    if (!tradeCategoryId || !ulbId) {
      console.error(
        "Validation Error: Missing required parameters in request body (tradeCategoryId, ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: tradeCategoryId and ulbId are mandatory.",
      });
    }

    const parsedTradeCategoryId = parseInt(tradeCategoryId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedTradeCategoryId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. tradeCategoryId: ${tradeCategoryId}, ulbId: ${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for tradeCategoryId or ulbId. Both must be numbers.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        arm.num_rate_tradetypename, -- Assuming this column exists in aomk_rate_mas based on user's query
        arm.num_rate_id AS tradeTypeId
      FROM
        aomk_rate_mas arm
      INNER JOIN
        aomk_tradetype_mas atm ON atm.num_tradetype_id = arm.num_rate_tradetypeid AND atm.aomk_tradetype_ulbid = arm.num_rate_ulbid
      WHERE
        atm.var_tradetype_flag = 'Y'
        AND atm.aomk_tradetype_tradecategoryid = :tradeCategoryId
        AND arm.num_rate_ulbid = :ulbId
      ORDER BY
        arm.num_rate_tradetypename -- Order by name for consistent results
    `;

    const binds = {
      tradeCategoryId: { val: parsedTradeCategoryId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching trade types by category:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
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
          "Internal Server Error during fetching trade types by category.",
        error: clientError,
      });
    }
  }
};

const getAppliTradeTypeDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      console.error(
        "Validation Error: Missing required parameters in request body (applicationId, ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters in request body: applicationId and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. applicationId: ${applicationId}, ulbId: ${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message:
          "Invalid format for applicationId or ulbId. Both must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        attd.num_applitradetype_id AS appliTradeTypeId,
        attd.num_applitradetype_appliid AS appliId,
        attd.num_applitradetype_trdtypid AS tradeTypeId,
        NVL(attd.num_applitrade_traderate, 0) AS rate,
        arm.num_rate_tradetypename AS tradeTypeName,
        arm.num_rate_id AS tradeTypeIdFromRateMas
      FROM
        aomk_applitradetyp_det attd
      INNER JOIN
        aomk_rate_mas arm ON arm.num_rate_id = attd.num_applitradetype_trdtypid
        AND arm.num_rate_ulbid = attd.num_applitradetyp_ulbid
      WHERE
        attd.num_applitradetype_appliid = :applicationId
        AND attd.num_applitradetyp_ulbid = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
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
    console.error("Error fetching application trade type details:", error);
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
          "Internal Server Error during fetching application trade type details.",
        error: clientError,
      });
    }
  }
};

const getApplicationDetails = async (req, res) => {
  let connection;

  try {
    const { AppliList_AppId, OrgId } = req.body;

    if (!AppliList_AppId || !OrgId) {
      return res
        .status(400)
        .json({ error: "Missing AppliList_AppId or OrgId" });
    }

    const query = `
      SELECT var_appli_applino, var_appli_applidt, var_appli_oldlicencno, var_appli_shopname, var_appli_panno,
        num_appli_contactno, var_appli_email, var_appli_address, num_appli_zoneid, num_appli_wardid, var_appli_isprod,
        var_appli_ownspace, var_appli_agrmentwith, num_appli_area, var_appli_iscorpnoc, num_appli_busstartyr,
        var_appli_shopactno, var_appli_foodlicno, num_appli_licdays, var_appli_shopnamemar, 
        var_appli_placeownername, var_appli_placeowneraddress, dat_appli_fromdt, dat_appli_todt,
        NVL(num_appli_amount, 0) AS amount, NVL(num_appli_arreasamt, 0) AS arreasamt
      FROM aomk_appli_mas
      WHERE num_appli_id = :appId AND num_appli_UlbId = :orgId
    `;

    connection = await getConnection();

    const result = await connection.execute(
      query,
      {
        appId: AppliList_AppId,
        orgId: OrgId,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No application found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching application details:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing the database connection:", closeError);
      }
    }
  }
};

const aomk_appli_ins = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const {
    In_UserId,             
    In_Appid,               
    In_AppliNo,             
    In_Mode,                 
    In_OldLicencNo,
    
    In_ShopName,            
    In_PANNo,                  
    In_ContactNo,              
    In_Email,                  
    In_Address,                
    In_ZoneId,                 
    In_WardId,                 
    In_IsProd,                 
    In_OwnSpace,               
    In_Agrmentwith,            
    In_Area,                   
    In_IsCorpNOC,              
    In_BusStartYr,             
    In_ShopActNo,              
    In_foodlicno,              
    In_LicDays,
    
    In_Applitrade_Str,
    In_Applitradetype_Str,
    In_Applidirector_Str,
    In_Source,

    In_ShopNameMar,
    In_PlaceOwnerName,
    In_PlaceOwnerAddress,

    
    In_FromDate,
    In_ToDate,
    in_amount,
    in_lictype,
    In_OrgId,
    in_ipaddr,
    
    in_licensetypeid,
    in_arreasamt,
    in_Servid,
    in_CFCRecno,
    in_PropNo,
    in_MarketPropNo        
    } = req.body;

  
    const bindVars = {
    In_UserId,             
    In_Appid,               
    In_AppliNo,             
    In_Mode,                 
    In_OldLicencNo,
    
    In_ShopName,            
    In_PANNo,                  
    In_ContactNo,              
    In_Email,                  
    In_Address,                
    In_ZoneId,                 
    In_WardId,                 
    In_IsProd,                 
    In_OwnSpace,               
    In_Agrmentwith,            
    In_Area,                   
    In_IsCorpNOC,              
    In_BusStartYr,             
    In_ShopActNo,              
    In_foodlicno,              
    In_LicDays,
    
    In_Applitrade_Str,
    In_Applitradetype_Str,
    In_Applidirector_Str,
    In_Source,

    In_ShopNameMar,
    In_PlaceOwnerName,
    In_PlaceOwnerAddress,

    
    In_FromDate,
    In_ToDate,
    in_amount,
    in_lictype,
    In_OrgId,
    in_ipaddr,
    
    in_licensetypeid,
    in_arreasamt,
    in_Servid,
    in_CFCRecno,
    in_PropNo,
    in_MarketPropNo,        
        Out_Errorcode: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        Out_Errormsg: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 200 },
        Out_Appid: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        Out_AppliNo: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        
    };

    const result = await connection.execute(
      `BEGIN 
         market.aomk_appli_ins(
    :In_UserId,             
    :In_Appid,               
    :In_AppliNo,             
    :In_Mode,                 
    :In_OldLicencNo,
    
    :In_ShopName,            
    :In_PANNo,                  
    :In_ContactNo,              
    :In_Email,                  
    :In_Address,                
    :In_ZoneId,                 
    :In_WardId,                 
    :In_IsProd,                 
    :In_OwnSpace,               
    :In_Agrmentwith,            
    :In_Area,                   
    :In_IsCorpNOC,              
    :In_BusStartYr,             
    :In_ShopActNo,              
    :In_foodlicno,              
    :In_LicDays,
    
    :In_Applitrade_Str,
    :In_Applitradetype_Str,
    :In_Applidirector_Str,
    :In_Source,

    :In_ShopNameMar,
    :In_PlaceOwnerName,
    :In_PlaceOwnerAddress,

    
    :In_FromDate,
    :In_ToDate,
    :in_amount,
    :in_lictype,
    :In_OrgId,
    :in_ipaddr,
    
    :in_licensetypeid,
    :in_arreasamt,
    :in_Servid,
    :in_CFCRecno,
    :in_PropNo,
    :in_MarketPropNo,       
     
        :Out_Errorcode, 
        :Out_Errormsg,
        :Out_Appid,
        :Out_AppliNo);
       END;`,
      bindVars,
      { autoCommit: true }
    );

    res.json({
      OUT_ERRORCODE: result.outBinds.Out_Errorcode,
      OUT_ERRORMSG: result.outBinds.Out_Errormsg,
      OUT_APPID: result.outBinds.Out_Appid,
      OUT_APPLINO: result.outBinds.Out_AppliNo
    });

  } catch (error) {
    console.error("❌ Error executing stored procedure:", error);
    res.status(500).json({
      OUT_ERRORCODE: -110,
      OUT_ERRORMSG: "Error processing application entry",
      ERROR: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("❌ Error closing Oracle connection:", closeErr);
      }
    }
  }
}; 


module.exports = {
  FrmApplicationEntryMst,
  getLicenseTypes,
  getApplicationTradeDetailsByAppId,
  getWardName,
  getDistinctZones,
  getTradeTypesByCategory,
  getAppliTradeTypeDetails,
  getApplicationDetails,
  aomk_appli_ins
};
