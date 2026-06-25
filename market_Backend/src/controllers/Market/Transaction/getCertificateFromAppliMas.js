const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { fileTypeFromBuffer } = require("file-type"); // ✅ Corrected import

const IMAGE_UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "generated_images");

const getCertificateFromAppliMas = async (req, res) => {
  let connection;

  try {
    // Ensure image directory exists
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
      console.log(`Created image upload directory: ${IMAGE_UPLOAD_DIR}`);
    }

    // Extract and validate input
    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: applicationId and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedUlbId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid format for applicationId or ulbId. Both must be numbers.",
      });
    }

    // DB call
    connection = await getConnection();

    const sqlQuery = `
      SELECT 
        blob_appli_certificate AS byteimg,
        var_appli_rtsapplino,
        var_appli_source
      FROM aomk_appli_mas
      WHERE num_appli_id = :applicationId 
        AND num_appli_ulbid = :ulbId
    `;

    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      fetchInfo: {
        BYTEIMG: { type: oracledb.BUFFER },
      },
    });

    const row = result.rows[0];

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "No record found for the provided applicationId and ulbId.",
      });
    }

    let fileUrl = null;

    if (row.BYTEIMG && row.BYTEIMG instanceof Buffer && row.BYTEIMG.length > 0) {
      console.log("Buffer Length:", row.BYTEIMG.length);

      const fileType = await fileTypeFromBuffer(row.BYTEIMG); // ✅ Correct usage
      const ext = fileType?.ext || "bin";
      const filename = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

      try {
        fs.writeFileSync(filePath, row.BYTEIMG);
        fileUrl = `/certificates/${filename}`; // Make sure Express is set to serve this path
      } catch (fileWriteError) {
        console.error(`Error saving certificate file ${filename}:`, fileWriteError);
      }
    } else {
      console.warn("Warning: BYTEIMG is null or empty");
    }

    res.status(200).json({
      data: {
        var_appli_rtsapplino: row.VAR_APPLI_RTSAPPLINO,
        var_appli_source: row.VAR_APPLI_SOURCE,
        fileUrl: fileUrl,
      },
    });

  } catch (error) {
    console.error("Error fetching certificate details:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error during certificate fetch.",
        error: {
          message: error.message,
          code: error.code,
          oracleErrorNum: error.errorNum,
        },
      });
    }
  }
};

module.exports = getCertificateFromAppliMas;
