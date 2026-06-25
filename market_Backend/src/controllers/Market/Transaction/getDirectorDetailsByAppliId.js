const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure
const fs = require("fs");
const path = require("path");
const crypto = require('crypto'); // For generating unique filenames

const IMAGE_UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'generated_images'); // Adjusted to lowercase 'generated_images'

const getDirectorDetailsByAppliId = async (req, res) => { // Updated function name
  let connection;
  let result;

  try {
    // Ensure the image upload directory exists
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
      console.log(`Created image upload directory: ${IMAGE_UPLOAD_DIR}`);
    }

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

    // 2. Get Database Connection
    connection = await getConnection();
    console.log("Database connection established for director details query.");

    // 3. Define the SQL Query
    const sqlQuery = `
      SELECT
        ad.num_applidirector_id AS directorId,
        ad.num_applidirector_aadhaarno AS aadhaarNo,
        ad.var_applidirector_name AS directorName,
        ad.num_applidirector_mobileno AS mobileNo,
        ad.var_applidirector_emailid AS email,
        ad.var_applidirector_gender AS gender,
        ad.var_applidirector_address AS address,
        ad.num_applidirector_applitype AS appliTypeId,
        am.var_applitype_name AS appliTypeName,
        ad.blo_applitype_photo AS directorImageBlob, -- FIX: Changed from 'am.blo_applitype_photo' to 'ad.blo_applitype_photo'
        ad.Var_AppliDirector_VoterId AS voterId
      FROM
        market.aomk_applidirector_det ad
      INNER JOIN
        market.aomk_applitype_mas am ON am.num_applitype_id = ad.num_applidirector_applitype
      WHERE
        ad.num_applidirector_appliid = :applicationId
      ORDER BY
        ad.num_applidirector_id
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        DIRECTORIMAGEBLOB: { type: oracledb.BUFFER }, // Ensure BLOB is fetched as Buffer
      },
    });

    console.log(`Found ${result.rows.length} director details for Application ID: ${applicationId}`);

    // 6. Process the results to save BLOB to file and generate URL
    const processedRows = result.rows.map(row => {
      let directorImageUrl = null;
      if (row.DIRECTORIMAGEBLOB && row.DIRECTORIMAGEBLOB instanceof Buffer && row.DIRECTORIMAGEBLOB.length > 0) {
        const filename = `${crypto.randomUUID()}.png`; // Assuming PNG, adjust if needed
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.DIRECTORIMAGEBLOB);
          // Construct the URL. The '/images' prefix must match your Express static middleware.
          directorImageUrl = `/images/${filename}`;
        } catch (fileWriteError) {
          console.error(`Error saving image file ${filename}:`, fileWriteError);
          // If saving fails, the URL will remain null for this entry
        }
      }

      // Return the row with the image URL, and remove the raw BLOB data
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
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching director details.",
        error: error.message,
      });
    }
  } finally {
    // 8. Close the Database Connection
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

module.exports = getDirectorDetailsByAppliId;