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

    const { applicationId, applicationNo, ulbId, userId } = req.body;

    const visitPhoto = req.files?.visitPhoto?.[0];
    const visitDocument = req.files?.visitDocument?.[0];

    if (!applicationId || !applicationNo || !ulbId || !userId) {
      return res.status(400).json({
        success: false,
        message: "applicationId, applicationNo, ulbId and userId are required.",
      });
    }

    if (!visitPhoto && !visitDocument) {
      return res.status(400).json({
        success: false,
        message: "Please upload Visit Photo or Visit Document.",
      });
    }

    connection = await getConnection();

    // ==========================
    // Visit Photo
    // ==========================
    if (visitPhoto) {
      await connection.execute(
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
          photo: visitPhoto.buffer,
          ulbId: Number(ulbId),
          userId,
        },
        {
          autoCommit: false,
        },
      );

      console.log("Visit Photo Uploaded.");
    }

    // ==========================
    // Visit Document
    // ==========================
    if (visitDocument) {
      await connection.execute(
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
          document: visitDocument.buffer,
          ulbId: Number(ulbId),
          userId,
        },
        {
          autoCommit: false,
        },
      );

      console.log("Visit Document Uploaded.");
    }

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
