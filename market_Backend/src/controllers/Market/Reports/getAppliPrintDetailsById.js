const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 
const fs = require("fs");
const path = require("path");
const crypto = require('crypto'); 

const IMAGE_UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'generated_images');

const getAppliPrintDetailsById = async (req, res) => {
  let connection;
  let result;

  try {
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
      console.log(`Created image upload directory: ${IMAGE_UPLOAD_DIR}`);
    }


    const { id, applino, ulbId } = req.body;

    // Validate mandatory parameters
    if (!id || !applino || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (id, applino, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: id, applino, and ulbId are mandatory.",
      });
    }

    // Parse and validate numeric IDs
    const parsedId = parseInt(id, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. id: ${id}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for id or ulbId. Both must be numbers.`,
      });
    }

    // Trim applino (which is a string)
    const trimmedApplino = String(applino).trim();
    if (trimmedApplino === '') {
      console.error(`Validation Error: Invalid applino: ${applino}. Expected a non-empty string.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for applino: ${applino}. Expected a non-empty string.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        id,
        applino AS applicationNo,
        appdt AS applicationDate,
        shop_name AS shopName,
        pan_cardno AS panCardNo,
        ward,
        contactno AS contactNo,
        email,
        address,
        zone,
        isprod AS isProd,
        ownspace AS ownSpace,
        agrmentwith AS agreementWith,
        area,
        iscorpnoc AS isCorpNoc,
        busstartyr AS businessStartYear,
        shopactno AS shopActNo,
        foodlicno AS foodLicNo,
        director_name AS directorName,
        director_address AS directorAddress,
        director_mobileno AS directorMobileNo,
        director_emailid AS directorEmailId,
        d_gender AS directorGender,
        d_apptypt AS directorAppType,
        d_photo AS directorPhotoBlob, -- Alias for BLOB column
        d_adharno AS directorAadhaarNo,
        appstatus AS applicationStatus,
        receiptno AS receiptNo,
        placeownername AS placeOwnerName,
        PLACEOWNERADDRESS AS placeOwnerAddress
      FROM
        view_appliprint
      WHERE
        id = :id
        AND applino = :applino
        AND ulbid = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      id: { val: parsedId, type: oracledb.NUMBER },
      applino: { val: trimmedApplino, type: oracledb.STRING },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
      fetchInfo: {
        DIRECTORPHOTOBLOB: { type: oracledb.BUFFER }, // Ensure BLOB is fetched as Buffer
      },
    });

    if (result.rows.length === 0) {
      console.log(`No application print details found for ID: ${id}, App No: ${trimmedApplino}, ULB ID: ${ulbId}`);
      return res.status(404).json({
        success: false,
        message: "No application print details found for the provided criteria.",
      });
    }

    const processedRows = result.rows.map(row => {
      let directorPhotoUrl = null;
      if (row.DIRECTORPHOTOBLOB && row.DIRECTORPHOTOBLOB instanceof Buffer && row.DIRECTORPHOTOBLOB.length > 0) {
        const filename = `${crypto.randomUUID()}.png`; // Assuming PNG. Adjust extension if necessary.
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.DIRECTORPHOTOBLOB);
          // Construct the URL. The '/images' prefix must match your Express static middleware.
          directorPhotoUrl = `/images/${filename}`;
          console.log(`Saved director photo to ${filePath} and generated URL: ${directorPhotoUrl}`);
        } catch (fileWriteError) {
          console.error(`Error saving director photo file ${filename}:`, fileWriteError);
          // If saving fails, the URL will remain null for this entry
        }
      }

      // Return the row with the image URL, and remove the raw BLOB data
      return {
        ...row,
        directorPhoto: directorPhotoUrl, // This now holds the URL
        DIRECTORPHOTOBLOB: undefined, // Remove the raw BLOB buffer from the final response
      };
    });

    // 7. Send the Results as JSON Response
    res.status(200).json({
      data: processedRows[0]
    });

  } catch (error) {
    console.error("Error fetching application print details by IDs:", error);
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
        message: "Internal Server Error during fetching application print details.",
        error: clientError,
      });
    }
  }
};

module.exports = getAppliPrintDetailsById;
