const fs = require("fs");
const path = require("path");
const oracledb = require("oracledb");
const puppeteer = require("puppeteer");
const Handlebars = require("handlebars");
const { getConnection } = require("../../../config/database");

// --- Paths ---
const TEMPLATES_BASE_DIR = __dirname;
const TEMPLATE_FILE_NAME = "certificate_template.html";
const RIGHT_LOGO_FILE_NAME = "right_to_public_Service_logo.jpg";
const SIGNATURE_IMAGE_FILE_NAME = "signature.png";

const TEMPLATE_FULL_PATH = path.join(TEMPLATES_BASE_DIR, TEMPLATE_FILE_NAME);
const RIGHT_LOGO_FULL_PATH = path.join(TEMPLATES_BASE_DIR, RIGHT_LOGO_FILE_NAME);
const SIGNATURE_IMAGE_FULL_PATH = path.join(TEMPLATES_BASE_DIR, SIGNATURE_IMAGE_FILE_NAME);

const OUTPUT_DIR = path.join(__dirname, "../../../generated_pdfs");

// --- Helper Functions ---
const getBase64Image = (buffer, mimeType = "image/jpeg") =>
  buffer ? `data:${mimeType};base64,${buffer.toString("base64")}` : null;

function safeParse(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return null;
  }
}

// --- Handlebars Helpers ---
Handlebars.registerHelper("formatDate", function (dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

Handlebars.registerHelper("formatDateTime", function (dateTimeValue) {
  if (!dateTimeValue) return "";
  const date = new Date(dateTimeValue);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString();
});

Handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

// --- Queries ---
const appliCertificateQueries = {
  getInitialAppliData: `
    SELECT blob_appli_certificate byteimg, var_appli_rtsapplino, var_appli_source
    FROM aomk_appli_mas
    WHERE num_appli_id = :appliId AND num_appli_ulbid = :ulbId
  `,
  getViewCertGenRpt: `
    SELECT * FROM view_certificategenrpt WHERE appliid = :appliId AND ulbid = :ulbId
  `,
  getShopType: `
    SELECT num_rate_tradetypename shoptype
    FROM aomk_mktlice_mas
    INNER JOIN aomk_appli_mas ON num_appli_id = num_mktlice_appliid
    INNER JOIN aomk_applitradetyp_det ON num_applitradetype_appliid = num_mktlice_appliid
    INNER JOIN aomk_rate_mas ON num_rate_id = num_applitradetype_trdtypid
    WHERE num_appli_id = :appliId AND num_mktlice_ulbid = :ulbId
  `,
  getLicenseDetails: `
    SELECT num_mktlice_appliid appliid, var_mktlice_licenceno licenceno, dat_appli_recdate amt_date,
          num_appli_recamount amount, dat_mktlice_validfrom validfrom,
          dat_mktlice_validtilldt validtilldt, var_appli_type
    FROM aomk_mktlice_mas
    INNER JOIN aomk_appli_mas apm ON apm.num_appli_id = num_mktlice_appliid
    WHERE var_mktlice_licenceno = :licenseNo AND num_mktlice_ulbid = :ulbId
    AND dat_appli_recdate IS NOT NULL
  `,
  getCorporationDetails: `
    SELECT var_corporation_code, var_corporation_name
    FROM admins.aoma_corporation_mas
    WHERE num_corporation_id = :ulbId
  `,
  getCorporationNameAndLogo: `
    SELECT var_corporation_name AS corporationName, blob_corporation_img AS corporationLogo
    FROM admins.aoma_corporation_mas
    WHERE num_corporation_id = :ulbId
  `,
  updateAppliCertificateBlob: `
    UPDATE aomk_appli_mas SET blob_appli_certificate = :BLOBDocImage
    WHERE num_appli_id = :appliId AND num_appli_ulbid = :ulbId
  `,
  deleteDigitalCertificate: `
    DELETE FROM aomk_digicert_det WHERE NUM_DIGICERT_UNIQUENO = :uniqueNo AND VAR_DIGICERT_FLAG = :flag
  `,
  insertDigiCertDetailNullDigicertBlob: `
    INSERT INTO aomk_digicert_det (NUM_DIGICERT_UNIQUENO, VAR_DIGICERT_FLAG, VAR_DIGICERT_USERID, BLOB_DIGICERT_CERT, BLOB_DIGICERT_DIGICERT, VAR_DIGICERT_INSBY, DATE_DIGICERT_INSDATE, VAR_DIGICERT_UPDTBY, DATE_DIGICERT_UPDTDATE)
    VALUES(:uniqueNo, :flag, :userIdStr, :BLOBDocImage, null, :userIdStr, SYSDATE, :userIdStr, SYSDATE)
  `,
  insertDigiCertDetailWithDigicertBlob: `
    INSERT INTO aomk_digicert_det (NUM_DIGICERT_UNIQUENO, VAR_DIGICERT_FLAG, VAR_DIGICERT_USERID, BLOB_DIGICERT_CERT, BLOB_DIGICERT_DIGICERT, VAR_DIGICERT_INSBY, DATE_DIGICERT_INSDATE, VAR_DIGICERT_UPDTBY, DATE_DIGICERT_UPDTDATE)
    VALUES(:uniqueNo, :flag, :userIdStr, :BLOBDocImage, :duplicateBLOBDocImage, :userIdStr, SYSDATE, :userIdStr, SYSDATE)
  `,
  getUserDigitalCertKey: `
    SELECT var_user_digicertkey FROM admins.aoma_user_def WHERE num_user_userid = :userId
  `
};

// --- Main Controller ---
const GenerateCertificate = async (req, res) => {
  const { appliId: rawAppliId, ulbId: rawUlbId, licenseNo, userId, directorDetails } = req.body;

  const appliId = parseInt(rawAppliId, 10);
  const ulbId = parseInt(rawUlbId, 10);

  if (isNaN(appliId) || isNaN(ulbId) || !licenseNo || !userId) {
    return res.status(400).json({
      error: "Missing or invalid required parameters. appliId and ulbId must be numbers, licenseNo and userId must be provided.",
    });
  }

  const uniqueIdForDigiCert = appliId;
  const digitalCertFlagForDB = "A";
  const userIdAsString = String(userId);

  // Ensure output directory exists
  try {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  } catch (err) {
    console.error("Error ensuring output directory:", err);
    return res.status(500).json({ error: "Server configuration error: Output directory unavailable." });
  }

  let connection;
  let pdfBuffer;

  try {
    connection = await getConnection();

    // --- Load Images ---
    const rightToPublicServiceLogoUri = fs.existsSync(RIGHT_LOGO_FULL_PATH)
      ? getBase64Image(fs.readFileSync(RIGHT_LOGO_FULL_PATH), "image/jpeg")
      : null;

    const signatureImageBase64 = fs.existsSync(SIGNATURE_IMAGE_FULL_PATH)
      ? getBase64Image(fs.readFileSync(SIGNATURE_IMAGE_FULL_PATH), "image/png")
      : null;

    // --- Fetch DB Data ---
    const [initialAppliDataResult, viewCertGenRptResult] = await Promise.all([
      connection.execute(appliCertificateQueries.getInitialAppliData, { appliId, ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
      connection.execute(appliCertificateQueries.getViewCertGenRpt, { appliId, ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT }),
    ]);

    const certificateDetails = safeParse(viewCertGenRptResult.rows[0]) || {};
    if (Object.keys(certificateDetails).length === 0)
      return res.status(404).json({ message: "Certificate details not found for the provided criteria." });

    const shopTypeResult = await connection.execute(appliCertificateQueries.getShopType, { appliId, ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const rawShopTypes = shopTypeResult.rows.map(row => safeParse(row.SHOPTYPE)).filter(Boolean);

    const licenseDetailsResult = await connection.execute(appliCertificateQueries.getLicenseDetails, { licenseNo, ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const licenseHistory = licenseDetailsResult.rows ? licenseDetailsResult.rows.map(row => safeParse(row)) : [];

    const corporationDetailsResult = await connection.execute(appliCertificateQueries.getCorporationDetails, { ulbId }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    const corporationDetails = corporationDetailsResult.rows[0] || {};

    // --- ULB Logo ---
    let ulbLogoBase64 = null;
    try {
      const ulbLogoResult = await connection.execute(
        appliCertificateQueries.getCorporationNameAndLogo,
        { ulbId },
        { outFormat: oracledb.OUT_FORMAT_OBJECT, fetchInfo: { CORPORATIONLOGO: { type: oracledb.BUFFER } } }
      );
      if (ulbLogoResult.rows.length > 0 && ulbLogoResult.rows[0].CORPORATIONLOGO)
        ulbLogoBase64 = getBase64Image(ulbLogoResult.rows[0].CORPORATIONLOGO, "image/png");
    } catch (e) {
      console.warn("Warning fetching ULB Logo:", e.message);
    }

    // --- Template Data ---
    const formattedCurrentDate = new Date().toLocaleDateString("en-GB");
    const templateData = {
      licenseNo: certificateDetails.LICENCNO || licenseNo || "",
      shopName: certificateDetails.SHOPNAME || "",
      contactNo: certificateDetails.CONTACTNO || "",
      address: certificateDetails.ADDRESS || "",
      shopTypes: rawShopTypes.join(", ") || "",
      tradeName: certificateDetails.TRADE_NAME || "",
      validFrom: certificateDetails.VALIDFROM,
      validTill: certificateDetails.VALIDTILLDT,
      amountPaidDate: certificateDetails.AMT_DATE,
      amountPaid: certificateDetails.AMOUNT || "",
      sanchalakName: certificateDetails.SANCHALAKNAME || "",
      sanchalakAddress: certificateDetails.SANCHALAKADDRESS || "",
      gender: certificateDetails.GENDER || "",
      sanchalakType: certificateDetails.SANCHALAKTYPE || "",
      corporationName: corporationDetails.VAR_CORPORATION_NAME || "भिवंडी-निजामपूर महानगरपालिका, भिवंडी",
      rightToPublicServiceLogoUri,
      ulbLogoFromService: ulbLogoBase64,
      signatureImage: signatureImageBase64,
      formattedCurrentDate,
      directorDetails: safeParse(directorDetails) || [],
    };

    // --- Generate HTML ---
    const templateSource = fs.readFileSync(TEMPLATE_FULL_PATH, "utf8");
    const template = Handlebars.compile(templateSource);
    const htmlContent = template(templateData);

    // --- Generate PDF ---
    const pdfFilename = `appli_certificate_${appliId}_${ulbId}.pdf`;
    const filePath = path.join(OUTPUT_DIR, pdfFilename);

    const chromePath = puppeteer.executablePath();
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: chromePath,
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Allow rendering
    pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    fs.writeFileSync(filePath, pdfBuffer);
    console.log(`✅ PDF generated successfully: ${filePath}`);

    // --- Update Database ---
    const bufferForDatabase = Buffer.from(pdfBuffer);

    await connection.execute(
      appliCertificateQueries.updateAppliCertificateBlob,
      { BLOBDocImage: bufferForDatabase, appliId, ulbId },
      { autoCommit: false }
    );

    const userKeyResult = await connection.execute(
      appliCertificateQueries.getUserDigitalCertKey,
      { userId: userIdAsString },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const userDigitalCertKey = userKeyResult.rows[0]?.VAR_USER_DIGICERTKEY || null;

    const digiCertBindParams = {
      uniqueNo: uniqueIdForDigiCert,
      flag: digitalCertFlagForDB,
      userIdStr: userIdAsString,
      BLOBDocImage: bufferForDatabase,
    };

    const insertQuery = userDigitalCertKey
      ? appliCertificateQueries.insertDigiCertDetailNullDigicertBlob
      : appliCertificateQueries.insertDigiCertDetailWithDigicertBlob;

    if (!userDigitalCertKey) {
      digiCertBindParams.duplicateBLOBDocImage = bufferForDatabase;
    }

    await connection.execute(insertQuery, digiCertBindParams, { autoCommit: false });
    await connection.commit();

    console.log("✅ Certificate inserted and committed successfully.");

    res.download(filePath, pdfFilename, (err) => {
      if (err) {
        console.error("Error sending PDF to client:", err);
        if (!res.headersSent)
          res.status(500).json({ message: "Error sending PDF after generation." });
      } else {
        console.log(`📄 PDF ${pdfFilename} sent successfully to client.`);
      }
    });
  } catch (error) {
    console.error("❌ Error generating certificate:", error);
    if (connection) {
      try {
        await connection.rollback();
        console.log("Rolled back transaction due to error.");
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    if (!res.headersSent)
      res.status(500).json({ message: "Internal Server Error during certificate generation.", error: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
};

module.exports = GenerateCertificate;
