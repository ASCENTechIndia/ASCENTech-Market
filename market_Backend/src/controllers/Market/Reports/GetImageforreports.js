const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

async function getImagesByAppliId(req, res) {
  let connection;
  try {
    const { appliId } = req.body;

    if (!appliId) {
      return res
        .status(400)
        .json({ error: "Missing appliId in request body." });
    }

    connection = await getConnection();
    console.log(`Connection obtained for getImagesByAppliId: ${appliId}`);

    const querySQL = `
            SELECT
                num_applidoc_appliid AS ID
            FROM
                aomk_applidoc_det
            WHERE
                num_applidoc_appliid = :appliId
                AND num_applidoc_docid IN (7, 8)
                AND LOWER(var_applidoc_doctype) IN ('.jpg', '.png', '.jpeg')
                FETCH FIRST 1 ROW ONLY
        `;

    const result = await connection.execute(
      querySQL,
      { appliId: appliId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // MODIFICATION START
    // If no images are found, return an empty object or a message, but don't block the flow with a 404.
    if (result.rows.length === 0) {
      console.log(
        `No images found for appliId: ${appliId} with document IDs 7 or 8. Proceeding with empty URLs.`
      );
      return res.status(200).json({
        ID: appliId, // Still include the appliId
        shopeimg_otr: null, // Or an empty string ''
        shopeimg_inr: null, // Or an empty string ''
      });
    }
    // MODIFICATION END

    const id = result.rows[0].ID;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const shopeimg_otr_url = `${baseUrl}/image/${id}/7`;
    const shopeimg_inr_url = `${baseUrl}/image/${id}/8`;

    res.status(200).json({
      ID: id,
      shopeimg_otr: shopeimg_otr_url,
      shopeimg_inr: shopeimg_inr_url,
    });
  } catch (err) {
    console.error("Error in getImagesByAppliId:", err);
    res
      .status(500)
      .json({ error: "Internal server error.", details: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Connection released for getImagesByAppliId.");
      } catch (err) {
        console.error("Error closing connection (getImagesByAppliId):", err);
      }
    }
  }
}

async function serveImageBlob(req, res) {
  let connection;
  try {
    const { appliId, docId } = req.params;

    if (!appliId || !docId) {
      return res
        .status(400)
        .json({ error: "Missing appliId or docId in URL parameters." });
    }

    connection = await getConnection();
    console.log(
      `Connection obtained for serveImageBlob: appliId=${appliId}, docId=${docId}`
    );

    const querySQL = `
            SELECT
                blo_applidoc_image,
                var_applidoc_doctype
            FROM
                aomk_applidoc_det
            WHERE
                num_applidoc_appliid = :appliId
                AND num_applidoc_docid = :docId
                AND LOWER(var_applidoc_doctype) IN ('.jpg', '.png', '.jpeg')
        `;

    const result = await connection.execute(
      querySQL,
      { appliId: appliId, docId: docId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      console.log(
        `Image not found in DB for appliId: ${appliId}, docId: ${docId}.`
      );
      return res
        .status(404)
        .json({
          message: `Image not found for appliId: ${appliId}, docId: ${docId}.`,
        });
    }

    const imageBlob = result.rows[0].BLO_APPLIDOC_IMAGE; // This should be a Buffer

    // --- NEW AND IMPROVED DEBUGGING CHECKS ---
    console.log(
      `--- Debugging Image BLOB for appliId=${appliId}, docId=${docId} ---`
    );
    console.log(`Fetched docType: ${result.rows[0].VAR_APPLIDOC_DOCTYPE}`);
    console.log(`Type of imageBlob variable: ${typeof imageBlob}`);
    console.log(
      `Is imageBlob an instanceof Buffer? ${imageBlob instanceof Buffer}`
    );
    console.log(
      `Is imageBlob null or undefined? ${
        imageBlob === null || imageBlob === undefined
      }`
    );

    if (imageBlob === null || imageBlob === undefined) {
      console.log(
        `WARNING: Image BLOB for appliId: ${appliId}, docId: ${docId} is NULL or undefined.`
      );
      return res
        .status(404)
        .json({
          message:
            "Image data is empty or corrupted in the database (NULL/undefined).",
        });
    }

    // If it's not a Buffer, let's log its constructor name if it's an object
    if (!(imageBlob instanceof Buffer)) {
      console.error(`CRITICAL ERROR: Expected imageBlob to be a Buffer.`);
      if (typeof imageBlob === "object" && imageBlob !== null) {
        console.error(
          `It is an object with constructor: ${imageBlob.constructor.name}`
        );
        // If it's an Oracle Lob object, we need to stream it.
        // This is the most likely cause if fetchAsBuffer is set but not working for some reason.
        if (imageBlob.constructor.name === "Lob") {
          console.warn(`Detected 'Lob' object. Attempting to stream BLOB.`);
          // Set content type before streaming
          let contentType = "application/octet-stream";
          const docType = result.rows[0].VAR_APPLIDOC_DOCTYPE;
          if (docType) {
            const lowerDocType = docType.toLowerCase();
            if (
              lowerDocType.includes(".jpg") ||
              lowerDocType.includes(".jpeg")
            ) {
              contentType = "image/jpeg";
            } else if (lowerDocType.includes(".png")) {
              contentType = "image/png";
            }
          }
          res.writeHead(200, { "Content-Type": contentType });

          // Create a promise to handle streaming the BLOB
          return new Promise((resolve, reject) => {
            imageBlob.on("data", (chunk) => {
              res.write(chunk); // Write each chunk to the response stream
            });
            imageBlob.on("end", () => {
              res.end(); // End the response when stream finishes
              console.log(
                `Successfully streamed BLOB for appliId=${appliId}, docId=${docId}`
              );
              resolve();
            });
            imageBlob.on("error", (streamErr) => {
              console.error(
                `Error streaming BLOB for appliId=${appliId}, docId=${docId}:`,
                streamErr
              );
              // Only send an error response if headers haven't been sent yet
              if (!res.headersSent) {
                res
                  .status(500)
                  .json({
                    error: "Failed to stream image data from database.",
                    details: streamErr.message,
                  });
              } else {
                res.end(); // End response if error occurs after headers sent
              }
              reject(streamErr);
            });
          });
        }
      }
      // If it's not a Lob object either, then it's an unexpected type
      console.error(
        `Returning 500: Unexpected imageBlob type. Raw value:`,
        imageBlob
      );
      return res
        .status(500)
        .json({
          message:
            "Server error: Image data format is incorrect or unexpected.",
        });
    }

    // If it reaches here, imageBlob IS a Buffer, proceed as before
    console.log(`Image Blob length: ${imageBlob.length} bytes.`);
    // --- END DEBUGGING CHECKS ---

    // Determine content type
    let contentType = "application/octet-stream";
    const docType = result.rows[0].VAR_APPLIDOC_DOCTYPE; // Re-fetch docType for clarity
    if (docType) {
      const lowerDocType = docType.toLowerCase();
      if (lowerDocType.includes(".jpg") || lowerDocType.includes(".jpeg")) {
        contentType = "image/jpeg";
      } else if (lowerDocType.includes(".png")) {
        contentType = "image/png";
      }
    }
    console.log(`Serving image with Content-Type: ${contentType}`);

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": imageBlob.length,
    });
    res.end(imageBlob);
  } catch (err) {
    console.error("Error in serveImageBlob (main catch block):", err);
    // Ensure headers aren't sent twice if an error occurs during streaming setup
    if (!res.headersSent) {
      res
        .status(500)
        .json({
          error: "Internal server error during image retrieval.",
          details: err.message,
        });
    } else {
      console.log(
        "Error occurred after headers sent, connection might be interrupted."
      );
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log("Connection released for serveImageBlob.");
      } catch (err) {
        console.error("Error closing connection (serveImageBlob):", err);
      }
    }
  }
}

module.exports = {
  getImagesByAppliId,
  serveImageBlob,
};
