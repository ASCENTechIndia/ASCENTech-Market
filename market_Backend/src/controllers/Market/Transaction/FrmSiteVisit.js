const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const getSiteVisitApplications = async (req, res) => {
  let connection;

  try {
    const { OrgId, Mode } = req.body;

    if (!OrgId) {
      return res.status(400).json({
        success: false,
        message: "OrgId is required.",
      });
    }

    connection = await getConnection();

    let query = `
      SELECT
        zonename AS zonename,
        wardname AS wardname,
        num_appli_id AS applicationid,
        CASE
          WHEN var_appli_source = 'RTS'
          THEN var_appli_rtsapplino
          ELSE var_appli_applino
        END AS applicationno,
        var_appli_applidt AS applicationdate,
        var_appli_shopname AS shopname,
        num_appli_busstartyr AS Businessyear,
        var_appli_panno AS panno,
        num_appli_contactno AS contactno,
        var_appli_email AS email,
        var_appli_address AS address,
        var_appli_flowtype AS flowtype
      FROM aomk_appli_mas
      INNER JOIN prop.vw_zonemas
        ON zoneid = num_appli_zoneid
       AND wardid = num_appli_wardid
      WHERE 1 = 1
    `;

    const binds = {
      OrgId: Number(OrgId),
    };

    // Keep conditions exactly as in old code
    if (OrgId == "870" || OrgId == "1690") {
      query += `
        AND var_appli_appstatus = 'ADV'
        AND num_appli_ulbid = :OrgId
        AND var_appli_flowtype IN ('S','C')
        ORDER BY num_appli_id DESC
      `;
    } else if ((OrgId == "1070" || OrgId == "1850") && Mode == "1") {
      query += `
        AND var_appli_appstatus = 'V'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    } else if ((OrgId == "1070" || OrgId == "1850") && Mode == "2") {
      query += `
        AND var_appli_appstatus = 'SV'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    } else if (OrgId == "1070" || OrgId == "1850") {
      query += `
        AND var_appli_appstatus = 'VA'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    } else {
      query += `
        AND var_appli_appstatus = 'V'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    }

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching site visit applications:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
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

const siteVisitVerification = async (req, res) => {
  let connection;

  try {
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
      In_ShopNameMar,
      In_PlaceOwnerName,
      In_PlaceOwnerAddress,
      In_FromDate,
      In_ToDate,
      in_amount,
      In_OrgId,
      In_ArrAmount,
      in_ipaddr,
      In_siuser,
      in_PropNo,
      in_MarketPropNo,
      In_Appstatus,
      In_Appstatusremark,
    } = req.body;

    if (!In_UserId || !In_Appid || !In_OrgId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters.",
      });
    }

    connection = await getConnection();

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
      In_Source: "DEPT",
      In_ShopNameMar,
      In_PlaceOwnerName,
      In_PlaceOwnerAddress,
      In_FromDate: new Date(In_FromDate),
      In_ToDate: new Date(In_ToDate),
      in_amount,
      In_OrgId,
      In_ArrAmount,
      in_ipaddr,
      In_siuser,
      in_PropNo,
      in_MarketPropNo,
      In_Appstatus,
      In_Appstatusremark,

      Out_Errorcode: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },

      Out_Errormsg: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 2000,
      },

      Out_Appid: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },

      Out_AppliNo: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 2000,
      },
    };

    const result = await connection.execute(
      `
      BEGIN
          aomk_ApplisiteVerify_ins(
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
              :In_OrgId,
              :In_ArrAmount,
              :in_ipaddr,
              :In_siuser,
              :in_PropNo,
              :in_MarketPropNo,
              :In_Appstatus,
              :In_Appstatusremark,
              :Out_Errorcode,
              :Out_Errormsg,
              :Out_Appid,
              :Out_AppliNo
          );
      END;
      `,
      bindVars,
      {
        autoCommit: true,
      },
    );

    return res.status(200).json({
      success: true,
      OUT_ERRORCODE: result.outBinds.Out_Errorcode,
      OUT_ERRORMSG: result.outBinds.Out_Errormsg,
      OUT_APPID: result.outBinds.Out_Appid,
      OUT_APPLINO: result.outBinds.Out_AppliNo,
    });
  } catch (error) {
    console.error("Error in Site Visit Verification:", error);

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
        console.error(err);
      }
    }
  }
};

const uploadSiteVisitFiles = async (req, res) => {
  let connection;

  try {
    const { applicationId, applicationNo, ulbId, userId, directorDetails, applicationDocuments, appStatus, entMode } = req.body;

    console.log("Payload:", { applicationId, applicationNo, ulbId, userId, directorDetails, applicationDocuments, appStatus, entMode })

    const visitPhoto = req.files.find((file) => file.fieldname === "visitPhoto");

    const visitDocument = req.files.find((file) => file.fieldname === "visitDocument");

    if (!applicationId || !applicationNo || !ulbId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Required parameters are missing.",
      });
    }

    connection = await getConnection();

    // Start Transaction
    await connection.execute("SAVEPOINT SITE_VISIT_START");

    // ==========================================================
    // Upload Visit Photo
    // ==========================================================

    if (visitPhoto) {
      const result = await connection.execute(
        `
        INSERT INTO aomk_applisitevisit_dtls
        (
            num_visit_id,
            var_visit_appliid,
            var_visit_applino,
            var_visit_docname,
            blob_visit_byts,
            num_visit_ulbid,
            var_visit_insby,
            dat_visit_insdt
        )
        VALUES
        (
            seq_sitevisitdoc_id.NEXTVAL,
            :applicationId,
            :applicationNo,
            'Visit Photo',
            :photo,
            :ulbId,
            :userId,
            SYSDATE
        )
        `,
        {
          applicationId: Number(applicationId),
          applicationNo,
          photo: {
            val: visitPhoto.buffer,
            type: oracledb.BLOB,
          },
          ulbId: Number(ulbId),
          userId,
        },
        {
          autoCommit: false,
        },
      );

      console.log("Visit Photo Uploaded. Rows :", result.rowsAffected);
    }

    // ==========================================================
    // Upload Visit Document
    // ==========================================================

    if (visitDocument) {
      const result = await connection.execute(
        `
        INSERT INTO aomk_applisitevisit_dtls
        (
            num_visit_id,
            var_visit_appliid,
            var_visit_applino,
            var_visit_docname,
            blob_visit_byts,
            num_visit_ulbid,
            var_visit_insby,
            dat_visit_insdt
        )
        VALUES
        (
            seq_sitevisitdoc_id.NEXTVAL,
            :applicationId,
            :applicationNo,
            'Visit Document',
            :document,
            :ulbId,
            :userId,
            SYSDATE
        )
        `,
        {
          applicationId: Number(applicationId),
          applicationNo,
          document: {
            val: visitDocument.buffer,
            type: oracledb.BLOB,
          },
          ulbId: Number(ulbId),
          userId,
        },
        {
          autoCommit: false,
        },
      );

      console.log("Visit Document Uploaded. Rows :", result.rowsAffected);
    }

    /*
      Frontend should send

      directorDetails = [
        {
          directorId: 1,
          imageField: "directorImage0"
        },
        {
          directorId: 2,
          imageField: "directorImage1"
        }
      ]

      and upload files

      directorImage0
      directorImage1
      ....
    */

    let directorImageCount = 0;

    let directors = [];

    if (directorDetails) {
      directors = typeof directorDetails === "string" ? JSON.parse(directorDetails) : directorDetails;
    }

    for (const director of directors) {
      const directorFile = req.files.find((file) => file.fieldname === director.imageField);

      if (!directorFile) continue;

      const result = await connection.execute(
        `
        UPDATE aomk_applidirector_det
           SET blo_applitype_photo = :directorPhoto
         WHERE num_applidirector_id = :directorId
           AND num_applidirector_appliid = :applicationId
        `,
        {
          directorPhoto: {
            val: directorFile.buffer,
            type: oracledb.BLOB,
          },

          directorId: Number(director.directorId),

          applicationId: Number(applicationId),
        },
        {
          autoCommit: false,
        },
      );

      directorImageCount += result.rowsAffected;

      console.log(`Director ${director.directorId} Image Updated`, result.rowsAffected);
    }

    console.log("Total Director Images Updated : ", directorImageCount);

    // ==========================================================
    // PART 3 STARTS HERE
    // Delete Existing Documents
    // Insert Documents
    // ==========================================================

    let documents = [];

    if (applicationDocuments) {
      documents =
        typeof applicationDocuments === "string"
          ? JSON.parse(applicationDocuments)
          : applicationDocuments;
    }

    // Get only documents whose files are actually uploaded
    const documentsToUpload = documents.filter((doc) =>
      req.files.some((file) => file.fieldname === doc.fileField)
    );

    let documentInsertCount = 0;

    // Delete old documents ONLY when new documents are uploaded
    if (documentsToUpload.length > 0) {
      await connection.execute(
        `
        DELETE FROM aomk_applidoc_det
        WHERE num_applidoc_appliid = :applicationId
        `,
        {
          applicationId: Number(applicationId),
        },
        {
          autoCommit: false,
        }
      );

      console.log("Existing Documents Deleted");
    }

    // Insert uploaded documents
    for (const doc of documentsToUpload) {
      const uploadedFile = req.files.find(
        (file) => file.fieldname === doc.fileField
      );

      const result = await connection.execute(
        `
        INSERT INTO aomk_applidoc_det
        (
            num_applidoc_id,
            num_applidoc_appliid,
            num_applidoc_docid,
            var_applidoc_doctype,
            blo_applidoc_image
        )
        VALUES
        (
            :primaryDocId,
            :applicationId,
            :docId,
            :fileType,
            :blobFile
        )
        `,
        {
          primaryDocId: Number(doc.primaryDocId),
          applicationId: Number(applicationId),
          docId: Number(doc.docId),
          fileType: doc.fileType,
          blobFile: {
            val: uploadedFile.buffer,
            type: oracledb.BLOB,
          },
        },
        {
          autoCommit: false,
        }
      );

      documentInsertCount += result.rowsAffected;
    }

    console.log("Documents Uploaded :", documentInsertCount);

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: "Site Visit Files Uploaded Successfully.",
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (err) {
        console.error(err);
      }
    }

    console.error(error);

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
        console.error(err);
      }
    }
  }
};

module.exports = {
  getSiteVisitApplications,
  siteVisitVerification,
  uploadSiteVisitFiles,
};
