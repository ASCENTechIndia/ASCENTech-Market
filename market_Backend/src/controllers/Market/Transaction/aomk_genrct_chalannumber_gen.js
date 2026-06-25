const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database");

const aomk_genrct_chalannumber_gen = async (req, res) => {
  let connection;

  // 1. Input Extraction and Validation
  try {
    const {
      username,
      chalanDate,
      receiptFromDate,
      receiptToDate,
      prabhagId,
      payMode,
      orgId
    } = req.body;

    const requiredFields = {
      orgId, username, chalanDate, receiptFromDate, receiptToDate, prabhagId, payMode
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        return res.status(400).json({ success: false, message: `${key} is required.`, errorCode: -400 });
      }
    }

    const numOrgId = Number(orgId);
    const numPrabhagId = Number(prabhagId);
    const numPayMode = Number(payMode);
    const trimmedUsername = String(username).trim();

    if (isNaN(numOrgId) || isNaN(numPrabhagId) || isNaN(numPayMode)) {
      return res.status(400).json({ success: false, message: "Invalid numeric ID provided.", errorCode: -401 });
    }

    connection = await getConnection();

    // 2. PL/SQL Execution Block
    const plsql = `
      BEGIN
        aomk_genrct_chalannumber_gen(
          in_username      => :in_username,
          in_chalandt      => TO_DATE(:in_chalandt,'DD-MM-YYYY'),
          in_Receiptfromdt => TO_DATE(:in_Receiptfromdt,'DD-MM-YYYY'),
          in_Receipttodt   => TO_DATE(:in_Receipttodt,'DD-MM-YYYY'),
          in_prabhagid     => :in_prabhagid,
          in_paymode       => :in_paymode,
          in_orgid         => :in_orgid,
          OUT_ERRCODE      => :OUT_ERRCODE,
          OUT_ERRMESSAGE   => :OUT_ERRMESSAGE
        );
      END;
    `;

    const binds = {
      in_username: trimmedUsername,
      // Date inputs MUST be in 'DD-MM-YYYY' format to match the TO_DATE mask in PL/SQL
      in_chalandt: chalanDate,
      in_Receiptfromdt: receiptFromDate,
      in_Receipttodt: receiptToDate,
      in_prabhagid: numPrabhagId,
      in_paymode: numPayMode,
      in_orgid: numOrgId,
      OUT_ERRCODE: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      OUT_ERRMESSAGE: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 1000 }
    };

    const result = await connection.execute(plsql, binds);

    const outErrCode = result.outBinds.OUT_ERRCODE;
    const outErrMessage = result.outBinds.OUT_ERRMESSAGE;

    // 3. Response Handling based on Procedure Output
    if (outErrCode === -100) {
      // Success case
      return res.status(200).json({ success: true, message: outErrMessage || 'Challan generated successfully.', errorCode: outErrCode });
    } else {
      // Expected business failure cases (e.g., -206: No Receipts Found, -208: Already Generated)
      // Use 400 status for business logic failures from the DB
      return res.status(400).json({ success: false, message: outErrMessage || 'Challan generation failed.', errorCode: outErrCode });
    }

  } catch (error) {
    // 4. Unexpected Technical Errors (e.g., DB connection issue, SQL parsing error)
    console.error('Error generating challan:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during Challan generation.', errorDetail: error.message });
  } finally {
    // 5. Connection Cleanup
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
};

module.exports = aomk_genrct_chalannumber_gen;