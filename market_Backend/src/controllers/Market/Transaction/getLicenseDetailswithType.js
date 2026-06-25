const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getLicenseDetailswithType = async (req, res) => {
  let connection; 

  try {
    const { licenseNo, ulbId } = req.body;

    if (!licenseNo || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (licenseNo, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: licenseNo and ulbId are mandatory.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    const parsedLicenseNo = licenseNo; 

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        num_mktlice_appliid AS appliid,
        var_mktlice_licenceno AS licenceno,
        dat_appli_recdate AS amt_date,
        num_appli_recamount AS amount,
        dat_mktlice_validfrom AS validfrom,
        dat_mktlice_validtilldt AS validtilldt,
        var_appli_type AS var_appli_type
      FROM
        aomk_mktlice_mas amlm
      INNER JOIN
        aomk_appli_mas apm ON apm.num_appli_id = amlm.num_mktlice_appliid
      WHERE
        amlm.var_mktlice_licenceno = :licenseNo
        AND amlm.num_mktlice_ulbid = :ulbId
        AND apm.dat_appli_recdate IS NOT NULL
    `;

    const binds = {
      licenseNo: { val: parsedLicenseNo, type: oracledb.STRING },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, 
    });

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No market license details found for License No: ${licenseNo}, ULB ID: ${ulbId}.`,
        data: []
      });
    }

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching market license details:", error);

    if (!res.headersSent) {
      const clientError = {
        message: error.message || "An unexpected internal server error occurred.",
      };
      if (typeof error.code === 'string' || typeof error.code === 'number') {
        clientError.code = error.code;
      }
      if (typeof error.errorNum === 'number') {
        clientError.oracleErrorNum = error.errorNum;
      }

      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching market license details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getLicenseDetailswithType;