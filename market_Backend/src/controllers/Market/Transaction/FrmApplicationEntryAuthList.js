const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmApplicationEntryAuthList = async (req, res) => {
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

    const appStatus = parsedUlbId === 870 || parsedUlbId === 1690 ? "ADV" : "V";

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        app.num_appli_id AS applicationid,
        app.var_appli_applino AS applicationno,
        app.var_appli_applidt AS applicationdate,
        app.var_appli_shopname AS shopname,
        app.num_appli_busstartyr AS Businessyear,
        app.var_appli_panno AS panno,
        app.num_appli_contactno AS contactno,
        app.var_appli_email AS email,
        app.var_appli_address AS address
      FROM
        aomk_appli_mas app
      INNER JOIN
        prop.vw_zonemas zm ON zm.zoneid = app.num_appli_zoneid AND zm.wardid = app.num_appli_wardid
      WHERE
        app.var_appli_appstatus = :appStatus
        AND app.num_appli_ulbid = :ulbId
      ORDER BY
        app.num_appli_id DESC
    `;

    const binds = {
      appStatus: { val: appStatus, type: oracledb.STRING },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching application details by status:", error);
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
          "Internal Server Error during fetching application details by status.",
        error: clientError,
      });
    }
  }
};

const getApplicationTypes = async (req, res) => {
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
      SELECT
        var_applitype_name AS applicationTypeName,
        num_applitype_id AS applicationTypeId
      FROM
        aomk_applitype_mas
      WHERE
        num_applitype_ulbid = :ulbId
        AND var_applitype_flag = 'Y'
      ORDER BY
        var_applitype_name -- Optional: Order by name for consistency
    `;

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
    console.error("Error fetching application types:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) {
      // Prevent "Cannot set headers after they are sent" error
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching application types.",
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

const fs = require("fs");
const path = require("path");
const crypto = require('crypto'); // For generating unique filenames

// Define the directory where images will be stored on the server.
// It's relative to the location where your Node.js application is run.
// Ensure this matches the path used in your Express static middleware configuration.
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

module.exports = { FrmApplicationEntryAuthList, getApplicationTypes, getDirectorDetailsWithApplicationId };
