const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure


const FrmLicenseEntryList = async (req, res) => { // Renamed from getMarketLicenseApplications as per user's code
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId, wardId } = req.body;

    if (!ulbId || !wardId) {
      console.error("Validation Error: Missing required parameters in request body (ulbId, wardId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters in request body: ulbId and wardId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    const parsedWardId = parseInt(wardId, 10);

    if (isNaN(parsedUlbId) || isNaN(parsedWardId)) {
      console.error(`Validation Error: Invalid input. ulbId: ${ulbId}, wardId: ${wardId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for ulbId or wardId. Both must be numbers.",
      });
    }

    // 2. Get Database Connection
    connection = await getConnection();
    console.log("Database connection established for market license query.");

    // 3. Define the SQL Query
    const sqlQuery = `
      SELECT
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        app.num_appli_id AS applicationid,
        app.var_appli_applino AS applicationno,
        app.var_appli_applidt AS applicationdate,
        mkt.var_mktlice_shopname AS shopname,
        -- FIX: Changed alias from mkt to app for num_appli_busstartyr and num_appli_contactno
        app.num_appli_busstartyr AS businessyear,
        mkt.var_mktlice_panno AS panno,
        app.num_appli_contactno AS contactno,
        mkt.var_mktlice_email AS email,
        mkt.var_mktlice_address AS address,
        mkt.num_mktlice_id AS mktlice_id
      FROM
        aomk_mktlice_mas mkt
      INNER JOIN
        aomk_appli_mas app ON mkt.num_mktlice_appliid = app.num_appli_id
      INNER JOIN
        prop.vw_zonemas zm ON zm.zoneid = app.num_appli_zoneid AND zm.wardid = app.num_appli_wardid
      WHERE
        app.var_appli_appstatus IN ('A', 'C')
        AND app.num_appli_ulbid = :ulbId
        AND app.num_appli_wardid = :wardId
      ORDER BY
        app.num_appli_id DESC
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      wardId: { val: parsedWardId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    console.log(`Found ${result.rows.length} market license applications for ULB ID: ${ulbId}, Ward ID: ${wardId}`);

    // 6. Send the Results as JSON Response
    res.status(200).json({
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching market license applications:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) { // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching market license applications.",
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

module.exports = FrmLicenseEntryList;
