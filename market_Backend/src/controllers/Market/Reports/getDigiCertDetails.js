const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure
const fs = require("fs");
const path = require("path");
const crypto = require("crypto"); // For generating unique filenames

// Define the directory where images/certificates will be stored on the server.
// Ensure this matches the path used in your Express static middleware configuration.
const FILE_UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "generated_files"
);

/**
 * API endpoint to retrieve digital certificate details, including BLOB data.
 * It fetches specific metadata from aomk_appli_mas and the certificate BLOB from aomk_digicert_det.
 * The BLOB data is saved to a server-side directory, and its URL is returned in the response.
 * This API expects parameters in the request body via a POST request.
 *
 * @param {object} req - The Express request object, containing parameters in req.body.
 * @param {object} res - The Express response object, used to send the JSON data.
 *
 * Request Body Parameters (JSON):
 * {
 * "AppliNo": "APP001", // Mandatory. The application number (var_appli_applino). Expected to be a string.
 * "OrgId": "5"         // Mandatory. The Organization ID (num_appli_ulbid). Expected to be a number.
 * }
 */
const getDigitalCertificateMetadataAndBlob = async (req, res) => {
  let connection;
  let result;

  try {
    // Ensure the file upload directory exists
    if (!fs.existsSync(FILE_UPLOAD_DIR)) {
      fs.mkdirSync(FILE_UPLOAD_DIR, { recursive: true });
      console.log(`Created file upload directory: ${FILE_UPLOAD_DIR}`);
    }

    // 1. Extract and Validate Input Parameters from the request body
    const { AppliNo, OrgId } = req.body;

    // --- Mandatory Parameter Validation ---
    if (!AppliNo || !OrgId) {
      console.error(
        "Validation Error: Missing required parameters in request body (AppliNo, OrgId)."
      );
      return res
        .status(400)
        .json({ success: false, message: "AppliNo and OrgId are mandatory." });
    }

    const trimmedAppliNo = String(AppliNo).trim();
    if (trimmedAppliNo === "") {
      console.error(
        `Validation Error: Invalid AppliNo: ${AppliNo}. Expected a non-empty string.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for AppliNo: ${AppliNo}. Expected a non-empty string.`,
        });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(
        `Validation Error: Invalid OrgId: ${OrgId}. Expected a number.`
      );
      return res
        .status(400)
        .json({
          success: false,
          message: `Invalid format for OrgId: ${OrgId}. Expected a number.`,
        });
    }

    // 2. Get Database Connection
    connection = await getConnection();
    console.log(
      "Database connection established for digital certificate metadata and BLOB query."
    );

    // 3. Define the SQL Query
    // The SELECT statement now explicitly matches your provided query for metadata
    // AND includes the BLOB column to allow processing.
    const sqlQuery = `
      SELECT
        am.num_appli_id AS appliId,
        am.var_appli_oldlicencno AS oldLicenseNo,
        am.var_appli_applino AS appliNo,
        am.num_appli_ulbid AS ulbId,
        ad.blob_digicert_cert AS digitalCertificateBlob -- Including the BLOB column for processing
      FROM
        aomk_digicert_det ad
      INNER JOIN
        aomk_appli_mas am ON am.num_appli_id = ad.num_digicert_uniqueno
      WHERE
        am.var_appli_applino = :AppliNo
        AND am.num_appli_ulbid = :OrgId
        AND ad.blob_digicert_cert IS NOT NULL
      ORDER BY
        am.num_appli_id DESC -- Ordering for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      AppliNo: { val: trimmedAppliNo, type: oracledb.STRING },
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
    };

    console.log("Executing SQL Query with binds:", binds);

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
      fetchInfo: {
        // Ensure the BLOB column is fetched as a Buffer
        DIGITALCERTIFICATEBLOB: { type: oracledb.BUFFER },
      },
    });

    console.log(
      `Found ${result.rows.length} digital certificate entries for AppliNo: ${AppliNo}, OrgId: ${OrgId}`
    );

    if (result.rows.length === 0) {
      console.log(
        `No digital certificate details found for AppliNo: ${AppliNo}, OrgId: ${OrgId}`
      );
      return res.status(404).json({
        success: false,
        message:
          "No digital certificate details found for the provided criteria.",
      });
    }

    // 6. Process the results to save BLOB to file and generate URL
    const processedRows = result.rows.map((row) => {
      let certificateUrl = null;
      if (
        row.DIGITALCERTIFICATEBLOB &&
        row.DIGITALCERTIFICATEBLOB instanceof Buffer &&
        row.DIGITALCERTIFICATEBLOB.length > 0
      ) {
        // Assuming the digital certificates are PDFs, hardcode the .pdf extension.
        // If the actual file type can vary, you would need a column in the database
        // to store the file's original extension or MIME type.
        const filename = `${crypto.randomUUID()}.pdf`; // Changed extension from .bin to .pdf
        const filePath = path.join(FILE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.DIGITALCERTIFICATEBLOB);
          // Construct the URL. The '/generated_files' prefix must match your Express static middleware.
          certificateUrl = `/generated_files/${filename}`;
          console.log(
            `Saved digital certificate to ${filePath} and generated URL: ${certificateUrl}`
          );
        } catch (fileWriteError) {
          console.error(
            `Error saving digital certificate file ${filename}:`,
            fileWriteError
          );
          // If saving fails, the URL will remain null for this entry
        }
      }

      // Return the row with the URL, and remove the raw BLOB data
      return {
        // Include all selected metadata fields
        appliId: row.APPLIID,
        oldLicenseNo: row.OLDLICENSENO,
        appliNo: row.APPLINO,
        ulbId: row.ULBID,
        digitalCertificateUrl: certificateUrl, // This now holds the URL
        // Do NOT include the raw BLOB buffer in the final response
        DIGITALCERTIFICATEBLOB: undefined,
      };
    });

    // 7. Send the Results as JSON Response
    res.status(200).json({
      success: true,
      data: processedRows, // Return all matching records if multiple exist
      message: "Digital certificate details fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching digital certificate details:", error);
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
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
          "Internal Server Error during fetching digital certificate details.",
        error: clientError,
      });
    }
  }
};

module.exports = getDigitalCertificateMetadataAndBlob;
