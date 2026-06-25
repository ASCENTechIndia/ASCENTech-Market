const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

/**
 * API endpoint to update the BLOB (image) data for a director's photo in aomk_applidirector_det.
 * It identifies the record by director ID and application ID.
 * The image data should be provided as binary data via a multipart/form-data upload.
 *
 * NOTE: This API expects the server to be configured with a multipart/form-data
 * parser middleware (e.g., 'multer' for Express) which makes the file
 * data available in 'req.file.buffer' or 'req.body.imageData' as a Buffer.
 *
 * @param {object} req - The Express request object.
 * - req.body: Contains 'directorid' and 'appid' (as strings).
 * - req.file: Contains the image Buffer in 'req.file.buffer'.
 * @param {object} res - The Express response object, used to send the JSON data.
 *
 * Request Body Parameters (Multipart Form-Data):
 * - Key: directorid (Text)  // Mandatory. The ID of the director record (num_applidirector_id). Expected to be a number.
 * - Key: appid (Text)       // Mandatory. The application ID associated with the director (num_applidirector_appliid). Expected to be a number.
 * - Key: imagedata (File)   // Mandatory. The image file. Select a file from your system.
 */
const updateDirectorPhoto = async (req, res) => {
  let connection;

  try {
    console.log("------ updateDirectorPhoto called ------");
    console.log("Step 1: Reading request body and file...");
    const { directorid, appid } = req.body; // Keys are lowercase now as per Postman screenshot
    console.log("Received req.body:", req.body);
    console.log("Received req.file:", req.file);

    // Step 2: Validate uploaded file
    if (!req.file || !req.file.buffer) {
      console.error("Validation Error: imagedata file is missing or buffer is empty.");
      return res.status(400).json({
        success: false,
        message: "imagedata file is missing.",
      });
    }

    const imageBuffer = req.file.buffer;

    // Step 3: Validate directorid and appid
    console.log("Step 3: Validating directorid and appid...");
    if (!directorid || !appid) {
      console.error("Validation Error: directorid and appid are mandatory.");
      return res.status(400).json({
        success: false,
        message: "directorid and appid are mandatory.",
      });
    }

    const parsedDirectorId = parseInt(directorid, 10);
    const parsedAppId = parseInt(appid, 10);

    if (isNaN(parsedDirectorId) || isNaN(parsedAppId)) {
      console.error(`Validation Error: directorid (${directorid}) or appid (${appid}) are not valid numbers.`);
      return res.status(400).json({
        success: false,
        message: "directorid and appid must be valid numbers.",
      });
    }

    connection = await getConnection();

    const updateSql = `
      UPDATE aomk_applidirector_det
      SET blo_applitype_photo = EMPTY_BLOB()
      WHERE num_applidirector_id = :directorId AND num_applidirector_appliid = :appId
      RETURNING blo_applitype_photo INTO :imageBlob
    `;

    const binds = {
      directorId: parsedDirectorId,
      appId: parsedAppId,
      imageBlob: { type: oracledb.BLOB, dir: oracledb.BIND_OUT }, // Output bind for the BLOB locator
    };

    console.log('Executing SQL Update for director photo with binds:', {
      directorId: binds.directorId,
      appId: binds.appId
    });

    const result = await connection.execute(updateSql, binds, { autoCommit: false });

    if (result.rowsAffected === 0) {
      console.warn(`No record found to update for directorId: ${directorid}, appId: ${appid}.`);
      return res.status(404).json({
        success: false,
        message: "No record found for the given directorid and appid.",
      });
    }

    // Get the BLOB locator from the outBinds
    const lob = result.outBinds.imageBlob[0];
    if (!lob) {
      console.error("Error: LOB locator not returned from RETURNING clause.");
      return res.status(500).json({
        success: false,
        message: "Failed to obtain BLOB locator for writing.",
      });
    }

    // Use a Promise to handle the asynchronous LOB write
    const writePromise = new Promise((resolve, reject) => {
      lob.on("error", (err) => {
        console.error("LOB write error:", err);
        // Ensure lob is closed on error to prevent resource leaks
        lob.destroy();
        reject(err);
      });

      lob.on("finish", () => {
        console.log("Step 6: BLOB write finished successfully.");
        resolve(true);
      });

      lob.on("close", () => {
        console.log("LOB stream closed.");
      });

      lob.write(imageBuffer, (err) => {
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
    console.log("Step 7: Committed transaction.");

    // 6. Send the Success Response
    res.status(200).json({
      success: true,
      message: "Director photo updated successfully.",
      rowsAffected: result.rowsAffected,
    });

  } catch (error) {
    console.error("❌ Error updating photo:", error);
    // Attempt rollback only if connection exists and is not already committed/closed
    if (connection) {
      try {
        // Rollback only if autoCommit was false and a transaction was active
        await connection.rollback();
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
        message: "Internal server error.",
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
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};

module.exports = updateDirectorPhoto;
