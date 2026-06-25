const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getMarketLicenseDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId, marketLicenseId, ulbId } = req.body;

    if (!applicationId || !marketLicenseId || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (applicationId, marketLicenseId, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters in request body: applicationId, marketLicenseId, and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedMarketLicenseId = parseInt(marketLicenseId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedMarketLicenseId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. applicationId: ${applicationId}, marketLicenseId: ${marketLicenseId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for applicationId, marketLicenseId, or ulbId. All must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        app.var_appli_applino AS applicationNo,
        app.var_appli_applidt AS applicationDate,
        app.var_appli_oldlicencno AS oldLicenseNo,
        mkt.var_mktlice_shopname AS shopName,
        mkt.var_mktlice_panno AS panNo,
        app.num_appli_contactno AS contactNo,
        mkt.var_mktlice_email AS email,
        mkt.var_mktlice_address AS address,
        app.num_appli_zoneid AS zoneId,
        app.num_appli_wardid AS wardId,
        mkt.var_mktlice_isprod AS isProd,
        mkt.var_mktlice_ownspace AS ownSpace,
        mkt.var_mktlice_agrmentwith AS agreementWith,
        app.num_appli_area AS area,
        mkt.var_mktlice_iscorpnoc AS isCorpNoc,
        mkt.num_mktlice_busstartyr AS businessStartYear,
        mkt.var_mktlice_shopactno AS shopActNo,
        mkt.var_mktlice_foodlicno AS foodLicNo,
        mkt.num_mktlice_licdays AS licenseDays,
        app.var_appli_shopnamemar AS shopNameMar,
        app.var_appli_placeownername AS placeOwnerName,
        app.var_appli_placeowneraddress AS placeOwnerAddress,
        app.dat_appli_fromdt AS fromDate,
        app.dat_appli_todt AS toDate,
        NVL(app.num_appli_amount, 0) AS amount,
        mkt.var_mktlice_licenceno AS licenseNo,
        app.num_appli_licensetypeid AS licenseTypeId,
        NVL(mkt.num_mktlice_arreasamt, 0) AS arrearsAmount
      FROM
        aomk_mktlice_mas mkt
      INNER JOIN
        aomk_appli_mas app ON mkt.num_mktlice_appliid = app.num_appli_id
      WHERE
        app.num_appli_id = :applicationId
        AND mkt.num_mktlice_id = :marketLicenseId
        AND mkt.num_mktlice_ulbid = :ulbId
    `;

    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
      marketLicenseId: { val: parsedMarketLicenseId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (result.rows.length === 0) {
      console.log(`No market license details found for Application ID: ${applicationId}, Market License ID: ${marketLicenseId}, ULB ID: ${ulbId}`);
      return res.status(404).json({
        success: false,
        message: "No market license details found for the provided criteria.",
      });
    }


    res.status(200).json({
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Error fetching market license details:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching market license details.",
        error: error.message,
      });
    }
  } finally {
    // 7. Close the Database Connection
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

module.exports = getMarketLicenseDetails;
