const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getDetailedApplicationInfo = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (applicationId, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: applicationId and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. applicationId: ${applicationId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId or ulbId. Both must be numbers.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        apm.var_appli_applino AS applino,
        apm.var_appli_applidt AS applidt,
        apm.var_appli_oldlicencno AS oldlicencno,
        apm.var_appli_shopname AS shopname,
        apm.var_appli_panno AS panno,
        apm.num_appli_contactno AS contactno,
        apm.var_appli_email AS email,
        apm.var_appli_address AS address,
        apm.num_appli_zoneid AS zoneid,
        apm.num_appli_wardid AS wardid,
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        apm.var_appli_isprod AS isprod,
        apm.var_appli_ownspace AS ownspace,
        apm.var_appli_agrmentwith AS agrmentwith,
        apm.num_appli_area AS area,
        apm.var_appli_iscorpnoc AS iscorpnoc,
        apm.num_appli_busstartyr AS busstartyr,
        apm.var_appli_shopactno AS shopactno,
        apm.var_appli_foodlicno AS foodlicno,
        apm.num_appli_licdays AS licdays,
        apm.var_appli_shopnamemar AS shopnamemar,
        apm.var_appli_placeownername AS placeownername,
        apm.var_appli_placeowneraddress AS placeowneraddress,
        apm.dat_appli_fromdt AS fromdt,
        apm.dat_appli_todt AS todt,
        NVL(apm.num_appli_amount,0) AS amount,
        NVL(apm.num_appli_arreasamt,0) AS arrearsamt
      FROM
        aomk_appli_mas apm -- Using alias 'apm' for aomk_appli_mas
      INNER JOIN
        prop.vw_zonemas zm ON zm.zoneid = apm.num_appli_zoneid AND zm.wardid = apm.num_appli_wardid AND zm.ulbid = apm.num_appli_ulbid
      WHERE
        apm.num_appli_id = :applicationId
        AND apm.num_appli_UlbId = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(`No detailed application info found for Application ID: ${applicationId}, ULB ID: ${ulbId}`);
      return res.status(404).json({
        success: false,
        message: "No detailed application information found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows[0]
    });

  } catch (error) {
    console.error("Error fetching detailed application info:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
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
        message: "Internal Server Error during fetching detailed application information.",
        error: clientError,
      });
    }
  } 
};

module.exports = getDetailedApplicationInfo;
