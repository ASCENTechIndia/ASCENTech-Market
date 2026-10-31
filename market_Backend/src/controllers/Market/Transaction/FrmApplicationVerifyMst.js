const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");


const FrmApplicationTradeDetails = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { applicationId } = req.body;

    if (!applicationId) {
      console.error("Validation Error: Missing required parameter in request body (applicationId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter in request body: applicationId is mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);

    if (isNaN(parsedApplicationId)) {
      console.error(`Validation Error: Invalid input. applicationId: ${applicationId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId: ${applicationId}. Expected a number.`,
      });
    }

    // 2. Establish Database Connection
    connection = await getConnection();

    // 3. SQL Query
    const sqlQuery = `
      SELECT 
        num_applitrade_id AS applitradeid,
        num_applitrade_appliid AS applicationid,
        num_applitrade_tradeid AS tradeid
      FROM 
        aomk_applitrade_det
      WHERE 
        num_applitrade_appliid = :applicationId
      ORDER BY 
        num_applitrade_id ASC
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
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
    console.error("Error fetching application trade details:", error);
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
        message: "Internal Server Error during fetching application trade details.",
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

const updateSiteReport = async (req, res) => {
  let connection;

  try {
    console.log("------ updateSiteReport called ------");
    const { appid, orgid } = req.body;
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    // Step 1: Validate required fields
    if (!req.file || !req.file.buffer) {
      console.error("Validation Error: filedata is missing or empty.");
      return res.status(400).json({
        success: false,
        message: "filedata file is missing.",
      });
    }

    if (!appid || !orgid) {
      console.error("Validation Error: appid and orgid are required.");
      return res.status(400).json({
        success: false,
        message: "appid and orgid are required.",
      });
    }

    const parsedAppId = parseInt(appid, 10);
    const parsedOrgId = parseInt(orgid, 10);

    if (isNaN(parsedAppId) || isNaN(parsedOrgId)) {
      return res.status(400).json({
        success: false,
        message: "appid and orgid must be valid numbers.",
      });
    }

    const imageBuffer = req.file.buffer;
    connection = await getConnection();

    // Step 2: Update query to prepare BLOB locator
    const updateSql = `
      UPDATE aomk_sditems_det
      SET blob_sditems_siterpt = EMPTY_BLOB()
      WHERE num_sditems_appliid = :appId
      AND num_sditems_ulbid = :orgId
      AND num_sditems_itemsid = 5
      RETURNING blob_sditems_siterpt INTO :blobOut
    `;

    const binds = {
      appId: parsedAppId,
      orgId: parsedOrgId,
      blobOut: { type: oracledb.BLOB, dir: oracledb.BIND_OUT },
    };

    console.log("Executing SQL Update for Site Report...");
    const result = await connection.execute(updateSql, binds, {
      autoCommit: false,
    });

    if (result.rowsAffected === 0) {
      console.warn(`No record found for appId=${appid}, orgId=${orgid}`);
      return res.status(404).json({
        success: false,
        message: "No record found for the given appid and orgid.",
      });
    }

    const lob = result.outBinds.blobOut[0];
    if (!lob) {
      console.error("Failed to obtain BLOB locator from RETURNING INTO.");
      return res.status(500).json({
        success: false,
        message: "Failed to obtain BLOB locator.",
      });
    }

    // Step 3: Write file buffer to BLOB stream
    const writePromise = new Promise((resolve, reject) => {
      lob.on("error", (err) => {
        console.error("LOB write error:", err);
        lob.destroy();
        reject(err);
      });

      lob.on("finish", () => {
        console.log("BLOB write finished successfully.");
        resolve();
      });

      lob.on("close", () => {
        console.log("LOB stream closed.");
      });

      lob.write(imageBuffer, (err) => {
        if (err) {
          console.error("LOB initial write error:", err);
          lob.destroy(err);
          return;
        }
        lob.end();
      });
    });

    await writePromise;

    // Step 4: Commit transaction
    await connection.commit();
    console.log("Transaction committed successfully.");

    // Step 5: Send success response
    res.status(200).json({
      success: true,
      message: "Site Report file updated successfully.",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    console.error("❌ Error updating Site Report:", error);
    if (connection) {
      try {
        await connection.rollback();
        console.log("Transaction rolled back due to error.");
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
    }
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal server error.",
        error: error.message,
      });
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("DB connection closed.");
      } catch (closeErr) {
        console.error("Error closing DB connection:", closeErr);
      }
    }
  }
};

const uploadDirectorPhoto = async (req, res) => {
  let connection;

  try {
    console.log("---- uploadDirectorPhoto API called ----");
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    const { appid, orgid } = req.body;

    // ✅ Validate required fields
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ success: false, message: "filedata is required" });
    }
    if (!appid || !orgid) {
      return res
        .status(400)
        .json({ success: false, message: "appid and orgid are required" });
    }

    const parsedAppId = parseInt(appid, 10);
    const parsedOrgId = parseInt(orgid, 10);

    if (isNaN(parsedAppId) || isNaN(parsedOrgId)) {
      return res
        .status(400)
        .json({ success: false, message: "appid and orgid must be numbers" });
    }

    const bufferFile = req.file.buffer;
    connection = await getConnection();

    const sql = `
      UPDATE aomk_sditems_det
      SET blob_sditems_photo = EMPTY_BLOB()
      WHERE num_sditems_appliid = :appId
      AND num_sditems_ulbid = :orgId
      AND num_sditems_itemsid = 4
      RETURNING blob_sditems_photo INTO :blobOut
    `;

    const binds = {
      appId: parsedAppId,
      orgId: parsedOrgId,
      blobOut: { type: oracledb.BLOB, dir: oracledb.BIND_OUT },
    };

    const result = await connection.execute(sql, binds, { autoCommit: false });

    if (result.rowsAffected === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No matching record found" });
    }

    const lob = result.outBinds.blobOut[0];

    const writeToBlob = new Promise((resolve, reject) => {
      lob.on("error", reject);
      lob.on("finish", resolve);
      lob.write(bufferFile);
      lob.end();
    });

    await writeToBlob;
    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Director photo uploaded successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("❌ ERROR:", err);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: err.message });
  } finally {
    if (connection) await connection.close();
  }
};

const updateReport = async (req, res) => {
  let connection;

  try {
    const { appid, orgid } = req.body;
    const file = req.file;

    if (!appid || !orgid) {
      return res.status(400).json({
        success: false,
        message: "appid and orgid are required",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "filedata (site report file) is required",
      });
    }

    connection = await getConnection();

    const query = `
      UPDATE aomk_sditems_det 
      SET blob_sditems_siterpt = :BlobDocFile 
      WHERE num_sditems_appliid = :AppId
      AND num_sditems_ulbid = :OrgId
      AND num_sditems_itemsid = 3
    `;

    const bindParams = {
      BlobDocFile: file.buffer,
      AppId: appid,
      OrgId: orgid,
    };

    const result = await connection.execute(query, bindParams, {
      autoCommit: true,
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "No record found to update",
      });
    }

    return res.json({
      success: true,
      message: "Site report uploaded successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {}
    }
  }
};
const updateADTPSiteReport = async (req, res) => {
  let connection;

  try {
    const { appid, orgid } = req.body;
    const file = req.file;

    if (!appid || !orgid) {
      return res.status(400).json({
        success: false,
        message: "appid and orgid are required",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "filedata (site report file) is required",
      });
    }

    connection = await getConnection();

    const query = `
      UPDATE aomk_adtpitems_det 
      SET blob_adtpitems_siterpt = :BlobDocFile
      WHERE num_adtpitems_appliid = :AppId
      AND num_adtpitems_ulbid = :OrgId
      AND num_adtpitems_itemsid = 4
    `;

    const bindParams = {
      BlobDocFile: file.buffer,
      AppId: appid,
      OrgId: orgid,
    };

    const result = await connection.execute(query, bindParams, {
      autoCommit: true,
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching record found to update",
      });
    }

    res.json({
      success: true,
      message: "ADTP site report uploaded successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {}
    }
  }
};

const updateSiteReportItem5 = async (req, res) => {
  let connection;

  try {
    const { appid, orgid } = req.body;
    const file = req.file;

    if (!appid || !orgid) {
      return res.status(400).json({
        success: false,
        message: "appid and orgid are required",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "filedata (site report file) is required",
      });
    }

    connection = await getConnection();

    const query = `
      UPDATE aomk_sditems_det
      SET blob_sditems_siterpt = :BlobDocFile
      WHERE num_sditems_appliid = :AppId
      AND num_sditems_ulbid = :OrgId
      AND num_sditems_itemsid = 5
    `;

    const bindParams = {
      BlobDocFile: file.buffer,
      AppId: appid,
      OrgId: orgid,
    };

    const result = await connection.execute(query, bindParams, {
      autoCommit: true,
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "No record found to update",
      });
    }

    res.json({
      success: true,
      message: "Site report (item 5) uploaded successfully",
      rowsAffected: result.rowsAffected,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {}
    }
  }
};


const getRate = async (req, res) => {
  let connection;

  try {
    const { orgid, tradetypeid, tradecategoryid } = req.body;

    if (!orgid || !tradetypeid || !tradecategoryid) {
      return res.status(400).json({
        success: false,
        message: "orgid, tradetypeid and tradecategoryid are required",
      });
    }

    connection = await getConnection();

    const query = `
      SELECT num_rate_rate 
      FROM aomk_rate_mas  
      INNER JOIN aomk_tradetype_mas 
        ON num_tradetype_id = num_rate_tradetypeid 
        AND aomk_tradetype_ulbid = num_rate_ulbid 
      INNER JOIN aomk_tradecategory_mas 
        ON num_tradecategory_id = aomk_tradetype_tradecategoryid 
        AND num_tradecategory_ulbid = num_rate_ulbid  
      WHERE num_rate_ulbid = :OrgId
      AND num_rate_id = :TradeTypeId
      AND num_tradecategory_id = :TradeCategoryId
    `;

    const result = await connection.execute(
      query,
      {
        OrgId: orgid,
        TradeTypeId: tradetypeid,
        TradeCategoryId: tradecategoryid,
      },
      { outFormat: require("oracledb").OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No rate found for given inputs",
      });
    }

    res.json({
      success: true,
      rate: result.rows[0].NUM_RATE_RATE,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) {}
    }
  }
};

const getRateByTradeType = async (req, res) => {
  const { tradeCategoryId, orgId } = req.body; // POST params

  if (!tradeCategoryId || !orgId) {
    return res.status(400).json({
      success: false,
      message: "tradeCategoryId and orgId are required",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const query = `
      SELECT 
        num_rate_tradetypename,
        num_rate_id
      FROM aomk_rate_mas
      INNER JOIN aomk_tradetype_mas 
        ON num_rate_tradetypeid = num_tradetype_id
        AND num_rate_ulbid = aomk_tradetype_ulbid
      WHERE var_tradetype_flag = 'Y'
        AND aomk_tradetype_tradecategoryid = :tradeCategoryId
        AND num_rate_ulbid = :orgId
    `;

    const result = await connection.execute(
      query,
      {
        tradeCategoryId: Number(tradeCategoryId),
        orgId: Number(orgId),
      },
      { outFormat: require("oracledb").OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle connection", err);
      }
    }
  }
};


const updateRateByTradeType = async (req, res) => {
  const { tradeCategoryId, orgId } = req.body;

  if (!tradeCategoryId || !orgId) {
    return res.status(400).json({
      success: false,
      message: "tradeCategoryId and orgId are required",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const query = `
      SELECT 
        var_tradetype_shortname || '.' || num_rate_tradetypename AS num_rate_tradetypename,
        num_rate_id
      FROM aomk_rate_mas
      INNER JOIN aomk_tradetype_mas 
        ON num_rate_tradetypeid = num_tradetype_id
        AND num_rate_ulbid = aomk_tradetype_ulbid
      WHERE var_tradetype_flag = 'Y'
        AND aomk_tradetype_tradecategoryid = :tradeCategoryId
        AND num_rate_ulbid = :orgId
    `;

    const result = await connection.execute(
      query,
      {
        tradeCategoryId: Number(tradeCategoryId),
        orgId: Number(orgId),
      },
      { outFormat: require("oracledb").OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle connection", err);
      }
    }
  }
};


const getRateAmountByIds = async (req, res) => {
  const { rateIds, fromDate, orgId } = req.body;

  if (!rateIds || !rateIds.length || !fromDate || !orgId) {
    return res.status(400).json({
      success: false,
      message: "rateIds[], fromDate and orgId are required",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const query = `
      SELECT  
        num_rate_id,
        SUM(num_rate_rate) AS tradType_rate
      FROM aomk_rate_mas
      WHERE num_rate_id IN (${rateIds.map((_, i) => `:id${i}`).join(",")})
        AND (TRUNC(dat_rate_fromdate) >= :fromDate OR dat_rate_todate IS NULL)
        AND num_rate_ulbid = :orgId
      GROUP BY num_rate_id
    `;

    const params = rateIds.reduce((obj, id, i) => {
      obj[`id${i}`] = Number(id);
      return obj;
    }, {});

    params.fromDate = new Date(fromDate); // format YYYY-MM-DD
    params.orgId = Number(orgId);

    const result = await connection.execute(
      query,
      params,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};


const getApplicationDocumentsDetails = async (req, res) => {
  const { appliId } = req.body;

  if (!appliId) {
    return res.status(400).json({
      success: false,
      message: "appliId is required",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const query = `
      SELECT 
        num_applidoc_id AS primaryDocId,
        num_applidoc_appliid AS AppliId,
        num_applidoc_docid AS docId,
        var_applidoc_doctype AS FileType,
        blo_applidoc_image AS filebyte,
        doctypename
      FROM aomk_applidoc_det
      INNER JOIN view_document_mas 
        ON docid = num_applidoc_docid
      WHERE num_applidoc_appliid = :appliId
    `;

    const result = await connection.execute(
      query,
      { appliId: Number(appliId) },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          FILEBYTE: { type: oracledb.BUFFER } // ✅ Convert BLOB to Buffer automatically
        }
      }
    );

    // ✅ Convert buffer → Base64 string
    const formattedRows = result.rows.map((row) => ({
      ...row,
      FILEBYTE: row.FILEBYTE ? row.FILEBYTE.toString("base64") : null
    }));

    return res.status(200).json({
      success: true,
      count: formattedRows.length,
      data: formattedRows,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const getApplicationDirectorsDetails = async (req, res) => {
  const { appliId } = req.body;

  if (!appliId) {
    return res.status(400).json({
      success: false,
      message: "appliId is required",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const query = `
      SELECT 
        num_applidirector_aadhaarno AS adharno,
        num_applidirector_id AS directorId,
        num_applidirector_appliid AS appliId,
        var_applidirector_name AS directorName,
        var_applidirector_address AS address,
        num_applidirector_mobileno AS mobileNo,
        var_applidirector_emailid AS email,
        var_applidirector_gender AS gender,
        num_applidirector_applitype AS appliTypeId,
        var_applitype_name AS appliTypeName,
        blo_applitype_photo AS imgDirectorImage,
        Var_AppliDirector_VoterId AS voterId
      FROM aomk_applidirector_det
      INNER JOIN aomk_applitype_mas 
        ON num_applitype_id = num_applidirector_applitype
      WHERE num_applidirector_appliid = :appliId
    `;

    const result = await connection.execute(
      query,
      { appliId: Number(appliId) },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          IMG_DIRECTORIMAGE: { type: oracledb.BUFFER } // ✅ auto convert BLOB → Buffer
        }
      }
    );

    // ✅ Convert Buffer → Base64 string
    const formattedRows = result.rows.map((row) => ({
      ...row,
      IMG_DIRECTORIMAGE: row.IMG_DIRECTORIMAGE
        ? row.IMG_DIRECTORIMAGE.toString("base64")
        : null,
    }));

    return res.status(200).json({
      success: true,
      count: formattedRows.length,
      data: formattedRows,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

const getVerifiedApplicationsDetails = async (req, res) => {
  let { userId, ulbId } = req.body;

  // ✅ userId stays string
  userId = userId?.toString().trim();

  // ✅ ulbId must remain a number
  ulbId = Number(ulbId);

  // ✅ Validation
  if (!userId || !ulbId) {
    return res.status(400).json({
      success: false,
      message: "userId (string) and ulbId (number) are required",
    });
  }

  let connection;

  try {
    connection = await getConnection();

    const query = `
      SELECT 
        num_appli_id AS "applicationId",
        var_appli_applino AS "applicationNo",
        var_appli_placeownername AS "applicantName",
        var_appli_address AS "address",
        zonename AS "zoneName",
        wardname AS "wardName",
        var_appli_shopname AS "shopName",
        var_appli_applidt AS "applicationDate"
      FROM aomk_appli_mas
      INNER JOIN prop.vw_zonemas 
        ON zoneid = num_appli_zoneid 
       AND wardid = num_appli_wardid
      WHERE 1=1
        AND var_appli_appstatus = 'V'
        AND num_appli_ulbid = :ulbId
        AND var_appli_flowtype = 'C'
        AND (var_appli_adtpstatus IS NULL OR var_appli_adtpstatus = 'ADTPH')
        AND var_appli_sdstatus IS NULL
        AND var_appli_papernotice IS NULL
        AND var_appli_type = 'N'
        AND num_appli_wardid IN (
              SELECT num_warduser_wardid 
              FROM aomk_warduser_config
              WHERE num_warduser_userid = :userId   -- ✅ fixed column
                AND num_warduser_ulbid = :ulbId
            )
      ORDER BY num_appli_id DESC
    `;

    const result = await connection.execute(
      query,
      { userId, ulbId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    return res.json({
      success: true,
      message: "Verified applications fetched successfully",
      count: result.rows.length,
      data: result.rows ?? [],
    });

  } catch (error) {
    console.error("🔴 getVerifiedApplicationsDetails Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });

  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle connection:", err);
      }
    }
  }
};


module.exports = {FrmApplicationTradeDetails, updateSiteReport,
  uploadDirectorPhoto,
  updateReport,
  updateADTPSiteReport,
  updateSiteReportItem5,
  getRate,
  getRateByTradeType,
  updateRateByTradeType,
  getRateAmountByIds,
  getApplicationDocumentsDetails,
  getApplicationDirectorsDetails,
  getVerifiedApplicationsDetails };
















