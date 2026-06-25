const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto'); 

const IMAGE_UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'generated_images');

const getDocumentDetailsWithAppliUlbId = async (req, res) => {
  let connection;
  let result;

  try {
    // Ensure the image upload directory exists
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
      console.log(`Created image upload directory: ${IMAGE_UPLOAD_DIR}`);
    }

    // 1. Extract and Validate Input Parameters from the request body
    const { applicationId, ulbId } = req.body; // Now expecting both

    if (!applicationId || !ulbId) { // Validate both
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
        vdm.docid AS primaryDocId,
        ad.num_applidoc_appliid AS appliId,
        vdm.docid AS docId,
        ad.var_applidoc_doctype AS fileType,
        ad.blo_applidoc_image AS fileByteBlob, -- Select BLOB column
        vdm.doctypename AS documentTypeName
      FROM
        view_document_mas vdm -- Added alias for view_document_mas to reference ulbid
      LEFT JOIN
        aomk_applidoc_det ad ON vdm.docid = ad.num_applidoc_docid
        AND ad.num_applidoc_appliid = :applicationId -- Using bind variable here
      WHERE
        vdm.ulbid = :ulbId -- New WHERE clause filter for ulbid
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER }, // Add ulbId to binds
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        FILEBYTEBLOB: { type: oracledb.BUFFER }, // Ensure BLOB is fetched as Buffer
      },
    });

    const processedRows = result.rows.map(row => {
      let fileUrl = null;
      if (row.FILEBYTEBLOB && row.FILEBYTEBLOB instanceof Buffer && row.FILEBYTEBLOB.length > 0) {
        // Generate a unique filename using UUID and assuming PNG. Adjust extension if necessary.
        const filename = `${crypto.randomUUID()}.png`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.FILEBYTEBLOB);
          fileUrl = `/images/${filename}`;
        } catch (fileWriteError) {
          console.error(`Error saving document image file ${filename}:`, fileWriteError);
          // If saving fails, the URL will remain null for this entry
        }
      }

      return {
        ...row,
        fileUrl: fileUrl, // This now holds the URL
        FILEBYTEBLOB: undefined, // Remove the raw BLOB buffer from the final response
      };
    });

    // 7. Send the Results as JSON Response
    res.status(200).json({
      data: processedRows,
    });

  } catch (error) {
    console.error("Error fetching document details:", error); // Log the full error object for server-side debugging
    if (!res.headersSent) {
      // Construct a safe error object to send to the client, avoiding circular references
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.", // Use error.message or a generic one
      };

      // Add specific Oracle error details if available and safe to include
      if (error.code) {
        clientError.code = error.code;
      }
      if (error.errorNum) {
        clientError.oracleErrorNum = error.errorNum;
      }

      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching document details.",
        error: clientError, // Send the safe, non-circular clientError object
      });
    }
  } 
};

module.exports = getDocumentDetailsWithAppliUlbId;
