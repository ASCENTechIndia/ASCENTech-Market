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

const FrmAppliVerificationMst = async (req, res) => {
  let connection;
  let result;

  try {
    // Ensure the image upload directory exists
    if (!fs.existsSync(IMAGE_UPLOAD_DIR)) {
      fs.mkdirSync(IMAGE_UPLOAD_DIR, { recursive: true });
      console.log(`Created image upload directory: ${IMAGE_UPLOAD_DIR}`);
    }

    // 1. Extract and Validate Input Parameters from the request body
    const { applicationId } = req.body; // Using 'applicationId' as the parameter name

    if (!applicationId) {
      console.error(
        "Validation Error: Missing required parameter in request body (applicationId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameter in request body: applicationId is mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);

    if (isNaN(parsedApplicationId)) {
      console.error(
        `Validation Error: Invalid input. applicationId: ${applicationId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId: ${applicationId}. Expected a number.`,
      });
    }

    // 2. Get Database Connection
    connection = await getConnection();
    console.log(
      "Database connection established for application document details query."
    );

    // 3. Define the SQL Query - EXACTLY as provided by the user, using bind variables for safety
    const sqlQuery = `
      SELECT
        addet.num_applidoc_id AS primaryDocId,
        addet.num_applidoc_appliid AS AppliId,
        addet.num_applidoc_docid AS docId,
        addet.var_applidoc_doctype AS FileType,
        addet.blo_applidoc_image AS filebyte, -- The BLOB column for processing
        vdm.doctypename AS doctypename
      FROM
        aomk_applidoc_det addet
      INNER JOIN
        view_document_mas vdm ON vdm.docid = addet.num_applidoc_docid
      WHERE
        addet.num_applidoc_appliid = :applicationId
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
    };

    console.log("Executing SQL Query with binds:", binds);

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
      fetchInfo: {
        FILEBYTE: { type: oracledb.BUFFER }, // Ensure BLOB is fetched as Buffer using its alias
      },
    });

    console.log(
      `Found ${result.rows.length} application document details for Application ID: ${applicationId}`
    );

    // 6. Process the results to save BLOB to file and generate URL
    const processedRows = result.rows.map((row) => {
      let documentFileUrl = null;
      // Use the alias 'FILEBYTE' to access the BLOB data
      if (
        row.FILEBYTE &&
        row.FILEBYTE instanceof Buffer &&
        row.FILEBYTE.length > 0
      ) {
        let fileExtension = "bin"; // Default to generic binary if type is unknown or invalid for display
        const docType = row.FileType ? String(row.FileType).toLowerCase() : "";

        // Prioritize common image formats based on FileType
        if (docType.includes("png")) {
          fileExtension = "png";
        } else if (docType.includes("jpeg") || docType.includes("jpg")) {
          fileExtension = "jpg";
        } else if (docType.includes("gif")) {
          fileExtension = "gif";
        } else if (docType.includes("pdf")) {
          fileExtension = "pdf"; // Explicitly keep PDF as PDF
        }

        // If after checking common types, it's still 'bin', and not explicitly a PDF,
        // then default to 'png' as per user's request.
        if (fileExtension === "bin" && !docType.includes("pdf")) {
          fileExtension = "png";
          console.warn(
            `Warning: FileType '${row.FileType}' for docId ${row.docId} is ambiguous/generic, defaulting to '.png' as requested.`
          );
        }

        const filename = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.FILEBYTE);
          // Construct the URL. The '/images' prefix must match your Express static middleware.
          documentFileUrl = `/images/${filename}`; // Assuming '/images' is the static path for all generated files
          console.log(
            `Saved document file to ${filePath} with extension '.${fileExtension}' and generated URL: ${documentFileUrl}`
          );
        } catch (fileWriteError) {
          console.error(
            `Error saving document file ${filename}:`,
            fileWriteError
          );
          // If saving fails, the URL will remain null for this entry
        }
      }

      // Return the row with the file URL, and remove the raw BLOB data
      return {
        ...row,
        fileUrl: documentFileUrl, // This now holds the URL to the saved file
        filebyte: undefined, // Remove the raw BLOB buffer from the final response
        FILEBYTE: undefined, // Also remove the aliased BLOB buffer
      };
    });

    // 7. Send the Results as JSON Response
    res.status(200).json({
      success: true,
      data: processedRows, // Return all matching records
      message: "Application document details fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching application document details:", error);
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
          "Internal Server Error during fetching application document details.",
        error: clientError,
      });
    }
  } finally {
    // 8. Close the Database Connection
    if (connection) {
      try {
        await connection.close();
        console.log("Database connection closed.");
      } catch (closeError) {
        console.error(
          "Error closing database connection in finally block:",
          closeError
        );
      }
    }
  }
};

const FrmAppliVerificationList = async (req, res) => {
  let connection; // Declare connection variable to ensure it's accessible in the finally block

  try {
    const { ulbId } = req.body; // Now accepting ulbId from the request body

    if (!ulbId) {
      console.error(
        "Validation Error: Missing required parameter in request body (ulbId)."
      );
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: ulbId is mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        zonename AS zonename,
        wardname AS wardname,
        num_appli_id AS applicationid,
        var_appli_applino AS applicationno,
        var_appli_applidt AS applicationdate,
        var_appli_shopname AS shopname,
        num_appli_busstartyr AS businessyear,
        var_appli_panno AS panno,
        num_appli_contactno AS contactno,
        var_appli_email AS email,
        var_appli_address AS address
      FROM
        aomk_appli_mas am
      INNER JOIN
        prop.vw_zonemas vz ON vz.zoneid = am.num_appli_zoneid AND vz.wardid = am.num_appli_wardid
      WHERE
        am.var_appli_appstatus IS NULL
        AND am.num_appli_ulbid = :ulbId -- Using bind variable for ULB ID
        AND (
              (am.var_appli_source = 'ONLINE' AND am.num_appli_onlcharges IS NOT NULL)
              OR (am.var_appli_source IN ('DEPT', 'RTS', NULL) OR am.var_appli_source IS NULL)
            )
      ORDER BY
        am.num_appli_id DESC
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER }, // Pass the parsed ULB ID
    };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return rows as JavaScript objects
    });

    // 6. Send the Results as JSON Response
    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    // 7. Centralized Error Handling
    console.error("Error fetching pending applications:", error);

    if (!res.headersSent) {
      const clientError = {
        message:
          error.message || "An unexpected internal server error occurred.",
      };
      if (typeof error.code === "string" || typeof error.code === "number") {
        clientError.code = error.code;
      }
      if (typeof error.errorNum === "number") {
        clientError.oracleErrorNum = error.errorNum;
      }

      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching pending applications.",
        error: clientError,
      });
    }
  }
};

const getDetailedApplicationInfo = async (req, res) => {
  let connection;
  let result;

  try {
    const { applicationId, ulbId } = req.body;

    if (!applicationId || !ulbId) {
      console.error(
        "Validation Error: Missing required parameters in request body (applicationId, ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: applicationId and ulbId are mandatory.",
      });
    }

    const parsedApplicationId = parseInt(applicationId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedApplicationId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. applicationId: ${applicationId}, ulbId: ${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for applicationId or ulbId. Both must be numbers.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        apm.var_appli_applino AS applino,
        apm.var_appli_applidt AS applidt,
        apm.var_appli_oldlicencno AS oldlicencno,
        apm.var_appli_shopname AS shopname,
        apm.var_appli_panno AS panno,
        apm.num_appli_contactno AS contactno,
        apm.var_appli_email AS email,
        apm.var_appli_address AS address,
        apm.num_appli_zoneid AS zoneid,
        apm.num_appli_wardid AS wardid,
        zm.zonename AS zonename,
        zm.wardname AS wardname,
        apm.var_appli_isprod AS isprod,
        apm.var_appli_ownspace AS ownspace,
        apm.var_appli_agrmentwith AS agrmentwith,
        apm.num_appli_area AS area,
        apm.var_appli_iscorpnoc AS iscorpnoc,
        apm.num_appli_busstartyr AS busstartyr,
        apm.var_appli_shopactno AS shopactno,
        apm.var_appli_foodlicno AS foodlicno,
        apm.num_appli_licdays AS licdays,
        apm.var_appli_shopnamemar AS shopnamemar,
        apm.var_appli_placeownername AS placeownername,
        apm.var_appli_placeowneraddress AS placeowneraddress,
        apm.dat_appli_fromdt AS fromdt,
        apm.dat_appli_todt AS todt,
        NVL(apm.num_appli_amount,0) AS amount,
        NVL(apm.num_appli_arreasamt,0) AS arrearsamt
      FROM
        aomk_appli_mas apm -- Using alias 'apm' for aomk_appli_mas
      INNER JOIN
        prop.vw_zonemas zm ON zm.zoneid = apm.num_appli_zoneid AND zm.wardid = apm.num_appli_wardid AND zm.ulbid = apm.num_appli_ulbid
      WHERE
        apm.num_appli_id = :applicationId
        AND apm.num_appli_UlbId = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      applicationId: { val: parsedApplicationId, type: oracledb.NUMBER },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(
        `No detailed application info found for Application ID: ${applicationId}, ULB ID: ${ulbId}`
      );
      return res.status(404).json({
        success: false,
        message:
          "No detailed application information found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching detailed application info:", error);
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
          "Internal Server Error during fetching detailed application information.",
        error: clientError,
      });
    }
  }
};

const getSpecificTradeRate = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, tradeTypeId, tradeCategoryId } = req.body;

    if (!ulbId || !tradeTypeId || !tradeCategoryId) {
      console.error(
        "Validation Error: Missing required parameters in request body (ulbId, tradeTypeId, tradeCategoryId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: ulbId, tradeTypeId, and tradeCategoryId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    const parsedTradeTypeId = parseInt(tradeTypeId, 10);
    const parsedTradeCategoryId = parseInt(tradeCategoryId, 10);

    if (
      isNaN(parsedUlbId) ||
      isNaN(parsedTradeTypeId) ||
      isNaN(parsedTradeCategoryId)
    ) {
      console.error(
        `Validation Error: Invalid input. ulbId: ${ulbId}, tradeTypeId: ${tradeTypeId}, tradeCategoryId: ${tradeCategoryId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message:
          "Invalid format for ulbId, tradeTypeId, or tradeCategoryId. All must be numbers.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        arm.num_rate_rate AS tradeRate
      FROM
        aomk_rate_mas arm
      INNER JOIN
        aomk_tradetype_mas atm ON atm.num_tradetype_id = arm.num_rate_tradetypeid
        AND atm.aomk_tradetype_ulbid = arm.num_rate_ulbid
      INNER JOIN
        aomk_tradecategory_mas atcm ON atcm.num_tradecategory_id = atm.aomk_tradetype_tradecategoryid
        AND atcm.num_tradecategory_ulbid = arm.num_rate_ulbid
      WHERE
        arm.num_rate_ulbid = :ulbId
        AND arm.num_rate_id = :tradeTypeId
        AND atcm.num_tradecategory_id = :tradeCategoryId
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      tradeTypeId: { val: parsedTradeTypeId, type: oracledb.NUMBER },
      tradeCategoryId: { val: parsedTradeCategoryId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    if (result.rows.length === 0) {
      console.log(
        `No trade rate found for ULB ID: ${ulbId}, Trade Type ID: ${tradeTypeId}, Trade Category ID: ${tradeCategoryId}`
      );
      return res.status(404).json({
        success: false,
        message: "No trade rate found for the provided criteria.",
      });
    }

    res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching specific trade rate:", error);
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
        message: "Internal Server Error during fetching specific trade rate.",
        error: clientError,
      });
    }
  }
};
module.exports = {
  FrmAppliVerificationMst,
  FrmAppliVerificationList,
  getDetailedApplicationInfo,
  getSpecificTradeRate,
};
