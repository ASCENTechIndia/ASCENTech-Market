const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getFullApplicationDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, applicationNo, appId } = req.body;

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

    const trimmedApplicationNo = applicationNo
      ? String(applicationNo).trim()
      : null;

    let parsedAppId = null;
    if (appId !== undefined && appId !== null && String(appId).trim() !== "") {
      parsedAppId = parseInt(appId, 10);
      if (isNaN(parsedAppId)) {
        console.error(
          `Validation Error: Invalid appId: ${appId}. Expected a number or null/empty.`
        );
        return res
          .status(400)
          .json({
            success: false,
            message: `Invalid format for appId: ${appId}. Expected a number or null/empty.`,
          });
      }
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        am.var_appli_applino AS applino,
        zm.zonename AS ZoneName,
        zm.wardname AS WardName,
        am.var_appli_applidt AS applidt,
        am.var_appli_oldlicencno AS oldlicencno,
        am.var_appli_shopname AS shopname,
        am.var_appli_panno AS panno,
        am.num_appli_contactno AS contactno,
        am.var_appli_email AS email,
        am.var_appli_address AS address,
        am.num_appli_zoneid AS zoneid,
        am.num_appli_wardid AS wardid,
        CASE WHEN am.var_appli_isprod = 'Y' THEN 'होय' ELSE 'नाही' END AS isprod,
        CASE WHEN am.var_appli_ownspace = 'Y' THEN 'होय' ELSE 'नाही' END AS ownspace,
        am.var_appli_agrmentwith AS agrmentwith,
        am.num_appli_area AS area,
        CASE WHEN am.var_appli_iscorpnoc = 'Y' THEN 'होय' ELSE 'नाही' END AS iscorpnoc,
        am.num_appli_busstartyr AS busstartyr,
        am.var_appli_shopactno AS shopactno,
        am.var_appli_foodlicno AS foodlicno,
        am.num_appli_licdays AS licdays,
        am.var_appli_shopnamemar AS shopnamemar,
        am.var_appli_placeownername AS placeownername,
        am.var_appli_placeowneraddress AS placeowneraddress,
        am.dat_appli_fromdt AS fromdt,
        am.dat_appli_todt AS todt,
        NVL(am.num_appli_amount, 0) AS amount
      FROM aomk_appli_mas am
      INNER JOIN prop.vw_zonemas zm
        ON am.num_appli_zoneid = zm.zoneid
        AND am.num_appli_wardid = zm.wardid
      WHERE am.num_appli_ulbid = :ulbId
        AND (:applicationNo IS NULL OR am.var_appli_applino = :applicationNo)
        AND (:appId IS NULL OR am.num_appli_id = :appId)
      ORDER BY
        am.var_appli_applino DESC -- Order for consistent results
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      applicationNo: { val: trimmedApplicationNo, type: oracledb.STRING }, // Will be null if not provided/empty
      appId: { val: parsedAppId, type: oracledb.NUMBER }, // Will be null if not provided/empty
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(
        `No full application details found for ULB ID: ${ulbId}, App No: ${
          applicationNo || "N/A"
        }, App ID: ${appId || "N/A"}`
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
    console.error("Error fetching full application details:", error);
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
          "Internal Server Error during fetching full application details.",
        error: clientError,
      });
    }
  }
};

module.exports = getFullApplicationDetails;
