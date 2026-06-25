const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const IMAGE_UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "generated_images"
);

const getDirectorDetailsWithAppliTypeUlb = async (req, res) => {
  let connection;
  let result;

  try {
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
      console.log(`Created image upload directory: ${IMAGE_UPLOAD_DIR}`);
    }

    const { appId, ulbId } = req.body;

    if (!appId || !ulbId) {
      console.error(
        "Validation Error: Missing required parameters in request body (appId, ulbId)."
      );
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: appId and ulbId are mandatory.",
      });
    }

    const parsedAppId = parseInt(appId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedAppId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. appId: ${appId}, ulbId: ${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for appId or ulbId. Both must be numbers.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        addet.num_applidirector_id AS directorid,
        addet.num_applidirector_aadhaarno AS adharno,
        addet.var_applidirector_name AS dirctorname,
        addet.num_applidirector_mobileno AS mobileno,
        addet.var_applidirector_emailid AS email,
        addet.var_applidirector_gender AS gender,
        addet.var_applidirector_address AS address,
        addet.num_applidirector_applitype AS applitypeid,
        atmas.var_applitype_name AS applitypename,
        addet.blo_applitype_photo AS imgdirectorimage -- Alias for BLOB column
      FROM
        market.aomk_applidirector_det addet
      INNER JOIN
        market.aomk_applitype_mas atmas ON atmas.num_applitype_id = addet.num_applidirector_applitype
      WHERE
        atmas.num_applitype_ulbid = :ulbId
        AND addet.num_applidirector_appliid = :appId
      ORDER BY
        addet.num_applidirector_id -- Order for consistent results
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      appId: { val: parsedAppId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
      fetchInfo: {
        IMGDIRECTORIMAGE: { type: oracledb.BUFFER }, // Ensure BLOB is fetched as Buffer using its alias
      },
    });

    const processedRows = result.rows.map((row) => {
      let directorPhotoUrl = null;
      // Use the alias 'IMGDIRECTORIMAGE' to access the BLOB data
      if (
        row.IMGDIRECTORIMAGE &&
        row.IMGDIRECTORIMAGE instanceof Buffer &&
        row.IMGDIRECTORIMAGE.length > 0
      ) {
        const filename = `${crypto.randomUUID()}.png`; // Assuming PNG. Adjust extension if necessary.
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.IMGDIRECTORIMAGE);
          // Construct the URL. The '/images' prefix must match your Express static middleware.
          directorPhotoUrl = `/images/${filename}`;
          console.log(
            `Saved director photo to ${filePath} and generated URL: ${directorPhotoUrl}`
          );
        } catch (fileWriteError) {
          console.error(
            `Error saving director photo file ${filename}:`,
            fileWriteError
          );
        }
      }

      return {
        ...row,
        imgdirectorimage: directorPhotoUrl, // This now holds the URL
        IMGDIRECTORIMAGE: undefined, // Remove the raw BLOB buffer from the final response
      };
    });

    res.status(200).json({
      data: processedRows,
    });
  } catch (error) {
    console.error("Error fetching director details:", error);
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
        message: "Internal Server Error during fetching director details.",
        error: clientError,
      });
    }
  }
};

module.exports = getDirectorDetailsWithAppliTypeUlb;
