const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

/**
 * 1️⃣ Get Application List (Main Paper Notice List)
 */
const getApplicationList = async (req, res) => {
  let connection;
  try {
    const { orgId } = req.body;

    if (!orgId) {
      return res.status(400).json({ success: false, message: "orgId is required." });
    }

    connection = await getConnection();
    const query = `
      SELECT num_appli_ulbid ulbid, zoneid, zonename, wardid, wardname,
             num_appli_id applicationid, var_appli_applino applicationno,
             var_appli_placeownername appliname, var_appli_applidt applicationdate,
             var_appli_shopname shopname, num_appli_busstartyr businessyear,
             var_appli_panno panno, num_appli_contactno contactno,
             var_appli_email email, var_appli_address address,
             var_appli_flowtype flowtype
      FROM aomk_appli_mas
      INNER JOIN prop.vw_zonemas
        ON zoneid = num_appli_zoneid AND wardid = num_appli_wardid
      WHERE var_appli_appstatus IN ('AV', 'SV', 'ADH')
        AND var_appli_flowtype = 'C'
        AND var_appli_type = 'N'
        AND var_appli_papernotice IS NULL
        AND num_appli_ulbid = :orgId
      ORDER BY num_appli_id DESC
    `;

    const result = await connection.execute(query, { orgId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json({ success: true, data: result.rows });

  } catch (error) {
    console.error("Error in getApplicationList:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * 2️⃣ Get Trade Category
 */
const getTradeCategory = async (req, res) => {
  let connection;
  try {
    const { orgId } = req.body;

    connection = await getConnection();
    const query = `
      SELECT var_tradecategory_name, num_tradecategory_id
      FROM aomk_TradeCategory_mas
      WHERE var_tradecategory_flag='Y' AND num_tradecategory_ulbid = :orgId
    `;

    const result = await connection.execute(query, { orgId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error in getTradeCategory:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * 3️⃣ Get Trade List
 */
const getTradeList = async (req, res) => {
  let connection;
  try {
    const { orgId } = req.body;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: "orgId is required in the request body.",
      });
    }

    connection = await getConnection();

    const query = `
      SELECT 
        num_trade_id AS tradeid, 
        var_trade_name AS tradename, 
        'N' AS flag
      FROM aomk_trade_mas
      WHERE var_trade_flag = 'Y' 
      AND num_trade_ulbid = :orgId
    `;

    const result = await connection.execute(
      query,
      { orgId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("❌ Error in getTradeList:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};

/**
 * 5️⃣ Get Application Details
 */
const getApplicationDetails = async (req, res) => {
  let connection;
  try {
    const { appId, orgId } = req.body;

    connection = await getConnection();
    const query = `
      SELECT var_appli_applino, var_appli_applidt, var_appli_oldlicencno, var_appli_shopname,
             var_appli_panno, num_appli_contactno, var_appli_email, var_appli_address,
             num_appli_zoneid, num_appli_wardid, zonename, wardname, var_appli_isprod,
             var_appli_ownspace, var_appli_agrmentwith, num_appli_area, var_appli_iscorpnoc,
             num_appli_busstartyr, var_appli_shopactno, var_appli_foodlicno, num_appli_licdays,
             var_appli_shopnamemar, var_appli_placeownername, var_appli_placeowneraddress,
             dat_appli_fromdt, dat_appli_todt, NVL(num_appli_amount,0) amount,
             NVL(num_appli_arreasamt,0) arreasamt, var_appli_adtpstatus, var_appli_sdstatus,
             var_appli_adtpfeedback, var_appli_sdfeedback, var_appli_adhyakshremark,
             var_appli_type, var_appli_certiremark
      FROM aomk_appli_mas
      INNER JOIN prop.vw_zonemas
        ON zoneid = num_appli_zoneid AND wardid = num_appli_wardid AND ulbid = num_appli_ulbid
      WHERE num_appli_id = :appId AND num_appli_UlbId = :orgId
    `;

    const result = await connection.execute(query, { appId, orgId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error in getApplicationDetails:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * 6️⃣ Get Application Trade Type Details
 */
const getAppTradeTypeDetails = async (req, res) => {
  let connection;
  try {
    const { appId, orgId } = req.body;

    connection = await getConnection();
    const query = `
      SELECT num_applitradetype_id, num_applitradetype_appliid, num_applitradetype_trdtypid,
             NVL(num_applitrade_traderate,0) Rate, num_rate_tradetypename tradetype,
             num_rate_id tradetypeid
      FROM aomk_applitradetyp_det
      INNER JOIN aomk_rate_mas
        ON num_rate_id = num_applitradetype_trdtypid
        AND num_rate_ulbid = num_applitradetyp_ulbid
      WHERE num_applitradetype_appliid = :appId
        AND num_applitradetyp_ulbid = :orgId
    `;

    const result = await connection.execute(query, { appId, orgId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error in getAppTradeTypeDetails:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

/**
 * 7️⃣ Get Application Trade Details
 */
const getAppTradeDetails = async (req, res) => {
  let connection;
  try {
    const { appId } = req.body;

    connection = await getConnection();
    const query = `
      SELECT num_applitrade_id, num_applitrade_appliid, num_applitrade_tradeid
      FROM aomk_applitrade_det
      WHERE num_applitrade_appliid = :appId
    `;

    const result = await connection.execute(query, { appId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error in getAppTradeDetails:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};

const IMAGE_UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'generated_images');

const getDirectorDetailsWithApplicationId = async (req, res) => {
  let connection;
  let result;

  try {
    // Ensure the image upload directory exists
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
      console.log(`Created image upload directory: ${IMAGE_UPLOAD_DIR}`);
    }

    // 1. Extract and Validate Input Parameters from the request body
    const { applicationId } = req.body; // Only applicationId is extracted

    if (!applicationId) { // Only check for applicationId
      console.error("Validation Error: Missing required parameter in request body (applicationId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: applicationId is mandatory.",
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

    connection = await getConnection();
    
    const sqlQuery = `
      SELECT
        ad.num_applidirector_id AS directorId,
        ad.num_applidirector_aadhaarno AS adharno,
        ad.var_applidirector_name AS dirctorname,
        ad.Var_AppliDirector_VoterId AS VoterId,
        ad.num_applidirector_mobileno AS mobileno,
        ad.var_applidirector_emailid AS email,
        ad.var_applidirector_gender AS gender,
        ad.var_applidirector_address AS address,
        ad.num_applidirector_applitype AS applitypeid,
        am.var_applitype_name AS applitypename,
        ad.blo_applitype_photo AS directorImageBlob -- Assuming blo_applitype_photo is from aomk_applidirector_det (ad)
      FROM
        market.aomk_applidirector_det ad
      INNER JOIN
        market.aomk_applitype_mas am ON am.num_applitype_id = ad.num_applidirector_applitype
        AND ad.num_applidirector_ulbid = am.num_applitype_ulbid -- ULBID join condition remains here
      WHERE
        ad.num_applidirector_appliid = :applicationId -- Only filtering by applicationId in WHERE clause
      ORDER BY
        ad.num_applidirector_id -- Optional: Order for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        DIRECTORIMAGEBLOB: { type: oracledb.BUFFER }, // Ensure BLOB is fetched as Buffer
      },
    });


    const processedRows = result.rows.map(row => {
      let directorImageUrl = null;
      if (row.DIRECTORIMAGEBLOB && row.DIRECTORIMAGEBLOB instanceof Buffer && row.DIRECTORIMAGEBLOB.length > 0) {
        const filename = `${crypto.randomUUID()}.png`; // Assuming PNG. Adjust extension if necessary.
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.DIRECTORIMAGEBLOB);
          directorImageUrl = `/images/${filename}`; // URL accessible via Express static middleware
          console.log(`Saved director image to ${filePath} and generated URL: ${directorImageUrl}`);
        } catch (fileWriteError) {
          console.error(`Error saving director image file ${filename}:`, fileWriteError);
        }
      }

      return {
        ...row,
        directorImage: directorImageUrl, // This now holds the URL
        DIRECTORIMAGEBLOB: undefined, // Remove the raw BLOB buffer
      };
    });

    // 7. Send the Results as JSON Response
    res.status(200).json({
      data: processedRows,
    });

  } catch (error) {
    console.error("Error fetching director details:", error);
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
        message: "Internal Server Error during fetching director details.",
        error: clientError,
      });
    }
  } 
};


const getApplicationDocuments = async (req, res) => {
  let connection;
  try {
    const { appId } = req.body;

    if (!appId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: appId.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
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
      WHERE num_applidoc_appliid = :appId
    `;

    const result = await connection.execute(sqlQuery, { appId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: { FILEBYTE: { type: oracledb.BUFFER } },
    });

    const processedRows = result.rows.map((row) => {
      let fileUrl = null;
      if (row.FILEBYTE && row.FILEBYTE instanceof Buffer && row.FILEBYTE.length > 0) {
        const filename = `${crypto.randomUUID()}.png`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, row.FILEBYTE);
        fileUrl = `/images/${filename}`;
      }

      return {
        ...row,
        documentUrl: fileUrl,
        FILEBYTE: undefined,
      };
    });

    res.status(200).json({
      success: true,
      data: processedRows,
    });
  } catch (error) {
    console.error("Error in getApplicationDocuments:", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) await connection.close();
  }
};


const getAdtpItems = async (req, res) => {
  let connection;
  try {
    const { appId, orgId } = req.body;

    if (!appId || !orgId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: appId or orgId.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT 
        adtpitems.num_adtpitems_id AS id,
        adtpitems.num_adtpitems_appliid AS appliid,
        adtpitems.num_adtpitems_ulbid AS ulbid,
        adtpitems.num_adtpitems_itemsid AS itemsid,
        adtpitem.var_adtpitems_name AS items,
        adtpitems.var_adtpitems_remark AS remark,
        adtpitems.blob_adtpitems_siterpt AS siterpt
      FROM aomk_adtpitems_det adtpitems
      INNER JOIN aomk_adtpitems_mas adtpitem
        ON adtpitem.num_adtpitems_id = adtpitems.num_adtpitems_itemsid
      WHERE num_adtpitems_appliid = :appId
        AND num_adtpitems_ulbid = :orgId
        AND num_adtpitems_itemsid = 4
    `;

    const result = await connection.execute(sqlQuery, { appId, orgId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: { SITERPT: { type: oracledb.BUFFER } },
    });

    const processedRows = result.rows.map((row) => {
      let siteReportUrl = null;
      if (row.SITERPT && row.SITERPT instanceof Buffer && row.SITERPT.length > 0) {
        const filename = `${crypto.randomUUID()}.pdf`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, row.SITERPT);
        siteReportUrl = `/images/${filename}`;
      }

      return {
        ...row,
        siteReportUrl,
        SITERPT: undefined,
      };
    });

    res.status(200).json({
      success: true,
      data: processedRows,
    });
  } catch (error) {
    console.error("Error in getAdtpItems:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error in getAdtpItems.",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};

const getSdItems = async (req, res) => {
  let connection;
  try {
    const { appId, orgId } = req.body;

    if (!appId || !orgId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: appId or orgId.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT 
        sditems.num_sditems_id AS id,
        sditems.num_sditems_appliid AS appliid,
        sditems.num_sditems_ulbid AS ulbid,
        sditems.num_sditems_itemsid AS itemsid,
        sditem.var_sditems_name AS items,
        sditems.var_sditems_remark AS remark,
        sditems.blob_sditems_siterpt AS siterpt,
        sditems.blob_sditems_photo AS photo
      FROM aomk_sditems_det sditems
      INNER JOIN aomk_sditems_mas sditem 
        ON sditem.num_sditems_id = sditems.num_sditems_itemsid
      WHERE num_sditems_appliid = :appId 
        AND num_sditems_ulbid = :orgId
        AND num_sditems_itemsid IN ('3','4','5')
    `;

    const result = await connection.execute(sqlQuery, { appId, orgId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        SITERPT: { type: oracledb.BUFFER },
        PHOTO: { type: oracledb.BUFFER },
      },
    });

    const processedRows = result.rows.map((row) => {
      let siteReportUrl = null;
      let photoUrl = null;

      if (row.SITERPT && row.SITERPT instanceof Buffer && row.SITERPT.length > 0) {
        const filename = `${crypto.randomUUID()}.pdf`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, row.SITERPT);
        siteReportUrl = `/images/${filename}`;
      }

      if (row.PHOTO && row.PHOTO instanceof Buffer && row.PHOTO.length > 0) {
        const filename = `${crypto.randomUUID()}.png`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);
        fs.writeFileSync(filePath, row.PHOTO);
        photoUrl = `/images/${filename}`;
      }

      return {
        ...row,
        siteReportUrl,
        photoUrl,
        SITERPT: undefined,
        PHOTO: undefined,
      };
    });

    res.status(200).json({
      success: true,
      data: processedRows,
    });
  } catch (error) {
    console.error("Error getSdItems:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error in getSdItems.",
      error: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
};


module.exports = {
  getApplicationList,
  getTradeCategory,
  getTradeList,
  
  getApplicationDetails,
  getAppTradeTypeDetails,
  getAppTradeDetails,
  getDirectorDetailsWithApplicationId,
  getApplicationDocuments,
  getAdtpItems,
  getSdItems
};
