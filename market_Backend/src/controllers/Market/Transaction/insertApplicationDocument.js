const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const insertApplicationDocument = async (req, res) => {
  let connection;

  try {
    console.log("------ insertApplicationDocument called ------");
    console.log("Step 1: Reading request body and file...");

    // Destructure properties from req.body (populated by multer for text fields)
    const { primaryDocId, appliId, docId, fileType } = req.body;
    console.log("Received req.body:", req.body);
    console.log("Received req.file:", req.file);

    // Step 2: Validate uploaded file (blobDocFile)
    if (!req.file || !req.file.buffer) {
      console.error("Validation Error: 'blobDocFile' is missing or buffer is empty.");
      return res.status(400).json({
        success: false,
        message: "'blobDocFile' (document file) is mandatory.",
      });
    }
    const blobDocFileBuffer = req.file.buffer;

    // Step 3: Validate mandatory numeric parameters
    console.log("Step 3: Validating primaryDocId, appliId, docId, and fileType...");

    if (!primaryDocId || !appliId || !docId || !fileType) {
      console.error("Validation Error: Missing required parameters (primaryDocId, appliId, docId, fileType).");
      return res.status(400).json({
        success: false,
        message: "All parameters (primaryDocId, appliId, docId, fileType, blobDocFile) are mandatory.",
      });
    }

    const parsedPrimaryDocId = parseInt(primaryDocId, 10);
    const parsedAppliId = parseInt(appliId, 10);
    const parsedDocId = parseInt(docId, 10);

    if (isNaN(parsedPrimaryDocId) || isNaN(parsedAppliId) || isNaN(parsedDocId)) {
      console.error(`Validation Error: Invalid format for numeric IDs. primaryDocId: ${primaryDocId}, appliId: ${appliId}, docId: ${docId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "primaryDocId, appliId, and docId must be valid numbers.",
      });
    }

    if (typeof fileType !== 'string' || fileType.trim() === '') {
      console.error(`Validation Error: Invalid fileType: ${fileType}. Expected a non-empty string.`);
      return res.status(400).json({
        success: false,
        message: "fileType must be a non-empty string.",
      });
    }
    const trimmedFileType = fileType.trim();

    console.log("Parsed primaryDocId:", parsedPrimaryDocId);
    console.log("Parsed appliId:", parsedAppliId);
    console.log("Parsed docId:", parsedDocId);
    console.log("Trimmed fileType:", trimmedFileType);
    console.log("Document buffer length:", blobDocFileBuffer.length);

    if (blobDocFileBuffer.length === 0) {
      console.error("Validation Error: Uploaded document file is empty.");
      return res.status(400).json({
        success: false,
        message: "Uploaded document file is empty.",
      });
    }

    // Step 4: Get Database Connection
    console.log("Step 4: Establishing Oracle DB connection...");
    connection = await getConnection();
    console.log("Oracle connection established.");

    // Step 5: Begin BLOB insert process
    console.log("Step 5: Executing insert query...");

    // SQL statement to insert a new row with EMPTY_BLOB() and return the BLOB locator
    const insertSql = `
      INSERT INTO aomk_applidoc_det
      (num_applidoc_id, num_applidoc_appliid, num_applidoc_docid, var_applidoc_doctype, blo_applidoc_image)
      VALUES
      (:primaryDocId, :appliId, :docId, :fileType, EMPTY_BLOB())
      RETURNING blo_applidoc_image INTO :blobDocFileLocator
    `;

    // Define binds for insert. The BLOB column will be an output bind.
    const binds = {
      primaryDocId: parsedPrimaryDocId,
      appliId: parsedAppliId,
      docId: parsedDocId,
      fileType: trimmedFileType,
      blobDocFileLocator: { type: oracledb.BLOB, dir: oracledb.BIND_OUT }, // Output bind for BLOB locator
    };

    console.log('Executing SQL Insert for application document with binds:', {
      primaryDocId: binds.primaryDocId,
      appliId: binds.appliId,
      docId: binds.docId,
      fileType: binds.fileType
    });

    // Execute the INSERT statement. Do not auto-commit here.
    const result = await connection.execute(insertSql, binds, { autoCommit: false });

    if (result.rowsAffected === 0) {
      console.error("Error: Insert statement affected 0 rows. This should not happen for a new insert returning a LOB.");
      await connection.rollback();
      return res.status(500).json({
        success: false,
        message: "Failed to insert document record or obtain BLOB locator.",
      });
    }

    // Get the BLOB locator from the outBinds
    const lob = result.outBinds.blobDocFileLocator[0];
    if (!lob) {
      console.error("Error: BLOB locator not returned from RETURNING clause.");
      await connection.rollback();
      return res.status(500).json({
        success: false,
        message: "Failed to obtain BLOB locator for writing document data.",
      });
    }

    // Use a Promise to handle the asynchronous LOB write
    const writePromise = new Promise((resolve, reject) => {
      lob.on("error", (err) => {
        console.error("LOB write error:", err);
        lob.destroy(err); // Destroy LOB on error
        reject(err);
      });

      lob.on("finish", () => {
        console.log("Step 6: BLOB write finished successfully.");
        resolve(true);
      });

      lob.on("close", () => {
        console.log("LOB stream closed.");
      });

      // Write the image buffer to the BLOB
      lob.write(blobDocFileBuffer, (err) => {
        if (err) {
          console.error("LOB write initial call error:", err);
          lob.destroy(err); // Destroy LOB on error
          return;
        }
        lob.end(); // Important: call end() after writing all data
      });
    });

    // Wait for the LOB write to complete
    await writePromise;

    // Commit the transaction after the BLOB write is finished
    await connection.commit();
    console.log("Step 7: Committed transaction successfully.");

    // 6. Send the Success Response
    res.status(200).json({
      success: true,
      message: `Document inserted successfully for primaryDocId: ${primaryDocId}, appliId: ${appliId}, docId: ${docId}.`,
      rowsAffected: result.rowsAffected,
    });

  } catch (error) {
    console.error("❌ Error inserting application document:", error);
    // Attempt rollback only if connection exists and is not already committed/closed
    if (connection) {
      try {
        await connection.rollback(); // Rollback on error
        console.log("Transaction rolled back due to error.");
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
    }
    // Ensure response is sent only if headers haven't been sent already
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
        message: "Internal Server Error during inserting application document.",
        error: clientError,
      });
    }
  } finally {
    // 7. Close the Database Connection
    if (connection) {
      try {
        await connection.close();
        console.log("DB connection closed.");
      } catch (closeErr) {
        console.error("Error closing database connection:", closeErr);
      }
    }
  }
};

module.exports = insertApplicationDocument;
