const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmApplicationListReport = async (req, res) => {
  let connection;
  let result;

  try {
    const { FromDt, ToDt, OrgId, ZoneId } = req.body;

    if (!FromDt || !ToDt || !OrgId) {
      console.error(
        "Validation Error: Missing required parameters in request body (FromDt, ToDt, OrgId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: FromDt, ToDt, and OrgId are mandatory.",
      });
    }

    const parsedOrgId = parseInt(OrgId, 10);
    if (isNaN(parsedOrgId)) {
      console.error(
        `Validation Error: Invalid input for OrgId: ${OrgId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for OrgId: ${OrgId}. Expected a number.`,
      });
    }

    let parsedZoneId = null; // Initialize as null for optional parameter
    if (ZoneId !== undefined && ZoneId !== null && ZoneId !== "") {
      parsedZoneId = parseInt(ZoneId, 10);
      if (isNaN(parsedZoneId)) {
        console.error(
          `Validation Error: Invalid input for ZoneId: ${ZoneId}. Expected a number or null/empty.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format for ZoneId: ${ZoneId}. Expected a number or null/empty.`,
        });
      }
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        applino AS applicationNo,
        zoneid AS zoneId,
        zonename AS zoneName,
        shopact_no AS shopActNo,
        shopname AS shopName,
        pan_no AS panNo,
        mob_no AS mobileNo,
        email AS email,
        owner_name AS ownerName,
        address AS address,
        appdate AS applicationDate
      FROM
        view_applicationlist
      WHERE
        TRUNC(appdate) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
        AND ulbid = :OrgId
        AND (:ZoneId IS NULL OR zoneid = :ZoneId)
    `;

    // 4. Define Bind Parameters
    const binds = {
      FromDt: { val: FromDt, type: oracledb.STRING },
      ToDt: { val: ToDt, type: oracledb.STRING },
      OrgId: { val: parsedOrgId, type: oracledb.NUMBER },
      ZoneId: { val: parsedZoneId, type: oracledb.NUMBER }, // Will be NULL if not provided
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching application list:", error);
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
        message: "Internal Server Error during fetching application list.",
        error: clientError,
      });
    }
  }
};

const getWardNamesAndIdsByUlbId = async (req, res) => {
  let connection;
  let result;

  try {
    // 1. Extract and Validate Input Parameters from the request body
    const { ulbId } = req.body;

    if (!ulbId) {
      console.error(
        "Validation Error: Missing required parameter in request body (ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameter in request body: ulbId is mandatory.",
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
        wardname AS wardName,
        wardid AS wardId
      FROM
        prop.vw_ward_mas
      WHERE
        ulbid = :ulbId
    `;

    // 4. Define Bind Parameters
    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching ward names and IDs:", error);
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
        message: "Internal Server Error during fetching ward names and IDs.",
        error: clientError,
      });
    }
  }
};

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
      console.error(
        "Validation Error: Missing required parameters in request body (id, applino, ulbId)."
      );
      return res.status(400).json({
        success: false,
        message:
          "Missing required parameters: id, applino, and ulbId are mandatory.",
      });
    }

    // Parse and validate numeric IDs
    const parsedId = parseInt(id, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedId) || isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid input. id: ${id}, ulbId: ${ulbId}. Expected numbers.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for id or ulbId. Both must be numbers.`,
      });
    }

    // Trim applino (which is a string)
    const trimmedApplino = String(applino).trim();
    if (trimmedApplino === "") {
      console.error(
        `Validation Error: Invalid applino: ${applino}. Expected a non-empty string.`
      );
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
      console.log(
        `No application print details found for ID: ${id}, App No: ${trimmedApplino}, ULB ID: ${ulbId}`
      );
      return res.status(404).json({
        success: false,
        message:
          "No application print details found for the provided criteria.",
      });
    }

    const processedRows = result.rows.map((row) => {
      let directorPhotoUrl = null;
      if (
        row.DIRECTORPHOTOBLOB &&
        row.DIRECTORPHOTOBLOB instanceof Buffer &&
        row.DIRECTORPHOTOBLOB.length > 0
      ) {
        const filename = `${crypto.randomUUID()}.png`; // Assuming PNG. Adjust extension if necessary.
        const filePath = path.join(IMAGE_UPLOAD_DIR, filename);

        try {
          fs.writeFileSync(filePath, row.DIRECTORPHOTOBLOB);
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
      data: processedRows[0],
    });
  } catch (error) {
    console.error("Error fetching application print details by IDs:", error);
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
          "Internal Server Error during fetching application print details.",
        error: clientError,
      });
    }
  }
};

const isValidDateDDMMYYYY = (dateString) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateString)) return false;

  const parts = dateString.split("-");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JavaScript Date
  const year = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
};

const getAppliPrintDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { ulbId, wardId, shopName, panCardNo, FromDt, ToDt } = req.body;

    // --- Validation ---
    if (!ulbId) {
      console.error("Validation Error: Missing required parameter: ulbId.");
      return res
        .status(400)
        .json({ success: false, message: "ULB ID is mandatory." });
    }
    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(
        `Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    if (wardId === undefined || wardId === null) {
      console.error("Validation Error: Missing required parameter: wardId.");
      return res.status(400).json({
        success: false,
        message: "Ward ID is mandatory. Use '-1' for all wards.",
      });
    }
    const parsedWardId = parseInt(wardId, 10);
    if (isNaN(parsedWardId)) {
      console.error(
        `Validation Error: Invalid wardId: ${wardId}. Expected a number or '-1'.`
      );
      return res.status(400).json({
        success: false,
        message: `Invalid format for wardId: ${wardId}. Expected a number or '-1'.`,
      });
    }

    const trimmedShopName = shopName ? String(shopName).trim() : null;
    const trimmedPanCardNo = panCardNo ? String(panCardNo).trim() : null;

    const useDateFilter =
      (!trimmedShopName || trimmedShopName === "") &&
      (!trimmedPanCardNo || trimmedPanCardNo === "");

    if (useDateFilter) {
      if (!FromDt || !ToDt) {
        console.error(
          "Validation Error: FromDt and ToDt are mandatory when shopName and panCardNo are not provided."
        );
        return res.status(400).json({
          success: false,
          message:
            "FromDt and ToDt are mandatory if shopName and panCardNo are not provided.",
        });
      }
      if (!isValidDateDDMMYYYY(FromDt.trim())) {
        console.error(
          `Validation Error: Invalid FromDt format or value: ${FromDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format or value for FromDt: '${FromDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
        });
      }
      if (!isValidDateDDMMYYYY(ToDt.trim())) {
        console.error(
          `Validation Error: Invalid ToDt format or value: ${ToDt}. Expected 'DD-MM-YYYY' and a valid calendar date.`
        );
        return res.status(400).json({
          success: false,
          message: `Invalid format or value for ToDt: '${ToDt}'. Expected 'DD-MM-YYYY' and a valid calendar date.`,
        });
      }
    } else {
      // If shopName or panCardNo are provided, date filters are not active in SQL,
      // but we still trim them for consistency if they exist.
      // No need to validate their date format if they won't be used as dates.
    }

    // 2. Get Database Connection
    connection = await getConnection();
    console.log(
      "Database connection established for application print details query."
    );

    // 3. Define the SQL Query
    // The WHERE clause complex logic is implemented directly in SQL
    // by relying on NULLs and the TRIM() function as per the original query's intent.
    const sqlQuery = `
      SELECT DISTINCT
        id, applino AS applicationNo, appdt AS applicationDate,
        shop_name AS shopName, pan_cardno AS panCardNo,
        contactno AS contactNo, email AS email, address AS address,
        d_gender AS gender
      FROM
        view_appliprint
      WHERE
        ulbid = :ulbId
        AND (:wardId = -1 OR ward = :wardId) -- Use -1 as wildcard for ward
        AND (
          (TRIM(:shopNameParam) IS NOT NULL AND TRIM(shop_name) = TRIM(:shopNameParam))
          OR (TRIM(:panCardNoParam) IS NOT NULL AND pan_cardno = :panCardNoParam)
          OR (
            (TRIM(:shopNameParam) IS NULL OR TRIM(:shopNameParam) = '') AND -- Both must be null/empty for date filter to activate
            (TRIM(:panCardNoParam) IS NULL OR TRIM(:panCardNoParam) = '') AND
            TRUNC(appdt) BETWEEN TO_DATE(:FromDt, 'DD-MM-YYYY') AND TO_DATE(:ToDt, 'DD-MM-YYYY')
          )
        )
      ORDER BY
        applino DESC -- Added an ORDER BY for consistent results
    `;

    const binds = {
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
      wardId: { val: parsedWardId, type: oracledb.NUMBER }, // Will be -1 or actual ward ID
      shopNameParam: { val: trimmedShopName, type: oracledb.STRING }, // Will be null if not provided
      panCardNoParam: { val: trimmedPanCardNo, type: oracledb.STRING }, // Will be null if not provided
      FromDt: {
        val: useDateFilter ? FromDt.trim() : null,
        type: oracledb.STRING,
      }, // Only bind if date filter is active
      ToDt: { val: useDateFilter ? ToDt.trim() : null, type: oracledb.STRING }, // Only bind if date filter is active
    };

    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching application print details:", error);
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
          "Internal Server Error during fetching application print details.",
        error: clientError,
      });
    }
  }
};

module.exports = {
  FrmApplicationListReport,
  getWardNamesAndIdsByUlbId,
  getAppliPrintDetailsById,
  getAppliPrintDetails,
};
