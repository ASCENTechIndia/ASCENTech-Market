const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure
const fs = require("fs");
const path = require("path");
const crypto = require('crypto'); // For generating unique filenames

// Define the directory where images will be stored on the server.
// It's relative to the location where your Node.js application is run.
// Ensure this matches the path used in your Express static middleware configuration.
const IMAGE_UPLOAD_DIR = path.join(__dirname, '..', '..', '..', 'generated_images');

/**
 * API endpoint to retrieve document details for a specific application.
 * It fetches data from view_document_mas and aomk_applidoc_det based on
 * the application ID. BLOB image data is saved to a server-side directory,
 * and its URL is returned.
 * This API expects the application ID in the request body via a POST request.
 *
 * @param {object} req - The Express request object, containing parameters in req.body.
 * @param {object} res - The Express response object, used to send the JSON data.
 *
 * Request Body Parameters (JSON):
 * {
 * "applicationId": "123" // Mandatory. The application ID (num_applidoc_appliid). Expected to be a number.
 * }
 */
const getDocumentDetails = async (req, res) => {
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
    console.log("Database connection established for document details query.");

    // 3. Define the SQL Query
    // This query is based on your original request, with table aliases (vdm, ad)
    // for clarity and bind variables for security and proper parameter handling.
    // The query itself has not been changed from its last functional state.
    const sqlQuery = `
      SELECT
        vdm.docid AS primaryDocId,
        ad.num_applidoc_appliid AS appliId,
        vdm.docid AS docId,
        ad.var_applidoc_doctype AS fileType,
        ad.blo_applidoc_image AS fileByteBlob, -- Select BLOB column
        vdm.doctypename AS documentTypeName
      FROM
        view_document_mas vdm
      LEFT JOIN
        aomk_applidoc_det ad ON vdm.docid = ad.num_applidoc_docid
        AND ad.num_applidoc_appliid = :applicationId -- Using bind variable here
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        FILEBYTEBLOB: { type: oracledb.BUFFER }, // Ensure BLOB is fetched as Buffer
      },
    });

    // 6. Process the results to save BLOB to file and generate URL
    const processedRows = result.rows.map(row => {
      let fileUrl = null;
      if (row.FILEBYTEBLOB && row.FILEBYTEBLOB instanceof Buffer && row.FILEBYTEBLOB.length > 0) {
        // Generate a unique filename using UUID and assuming PNG. Adjust extension if necessary.
        const filename = `${crypto.randomUUID()}.png`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.FILEBYTEBLOB);
          // Construct the URL. The '/images' prefix must match your Express static middleware.
          fileUrl = `/images/${filename}`;
        } catch (fileWriteError) {
          console.error(`Error saving document image file ${filename}:`, fileWriteError);
          // If saving fails, the URL will remain null for this entry
        }
      }

      return {
        ...row,
        fileUrl: fileUrl,
        FILEBYTEBLOB: undefined, 
      };
    });

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
 

const getSiteVisitDocuments = async (req, res) => {
  let connection;

  try {
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
    }

    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      return res.status(400).json({
        success: false,
        message: "applicationId and ulbId are required.",
      });
    }

    connection = await getConnection();

    const query = `
      SELECT
          num_visit_id              AS DOCID,
          var_visit_appliid         AS APPLICATIONID,
          var_visit_applino         AS APPLICATIONNO,
          var_visit_docname         AS DOCTYPENAME,
          blob_visit_byts           AS FILEBYTE
      FROM aomk_applisitevisit_dtls
      WHERE num_visit_ulbid = :ulbId
        AND var_visit_appliid = :applicationId
      ORDER BY num_visit_id
    `;

    const result = await connection.execute(
      query,
      {
        ulbId: Number(ulbId),
        applicationId: String(applicationId),
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          FILEBYTE: {
            type: oracledb.BUFFER,
          },
        },
      }
    );

    const processedRows = result.rows.map((row) => {
      let fileUrl = null;

      if (
        row.FILEBYTE &&
        Buffer.isBuffer(row.FILEBYTE) &&
        row.FILEBYTE.length > 0
      ) {
        const fileName = `${crypto.randomUUID()}.png`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, fileName);

        fs.writeFileSync(filePath, row.FILEBYTE);

        fileUrl = `/images/${fileName}`;
      }

      return {
        docId: row.DOCID,
        applicationId: row.APPLICATIONID,
        applicationNo: row.APPLICATIONNO,
        documentTypeName: row.DOCTYPENAME,
        fileUrl,
      };
    });

    return res.status(200).json({
      success: true,
      count: processedRows.length,
      data: processedRows,
    });
  } catch (err) {
    console.error("Error fetching site visit documents:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error(e);
      }
    }
  }
};
module.exports = {getDocumentDetails, getSiteVisitDocuments};