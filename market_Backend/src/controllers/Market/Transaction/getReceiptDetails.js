const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const getReceiptDetails = async (req, res) => {
  let connection;
  let result;

  try {
    const { departmentId, receiptNo, ulbId } = req.body;

    if (!departmentId || !receiptNo || !ulbId) {
      console.error("Validation Error: Missing required parameters in request body (departmentId, receiptNo, ulbId).");
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: departmentId, receiptNo, and ulbId are mandatory.",
      });
    }

    const parsedDepartmentId = parseInt(departmentId, 10);
    const parsedUlbId = parseInt(ulbId, 10);

    if (isNaN(parsedDepartmentId) || isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid input. departmentId: ${departmentId}, ulbId: ${ulbId}. Expected numbers.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for departmentId or ulbId. Both must be numbers.",
      });
    }

    if (typeof receiptNo !== 'string' || receiptNo.trim() === '') {
      console.error(`Validation Error: Invalid receiptNo: ${receiptNo}. Expected a non-empty string.`);
      return res.status(400).json({
        success: false,
        message: "Invalid format for receiptNo. Expected a non-empty string.",
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT
        var_rec_receiptno AS receiptNo,
        var_rec_demandid AS demandId
      FROM
        cfc.aofc_rec_mas
      WHERE
        num_rec_deptid = :departmentId
        AND var_rec_receiptno = :receiptNo
        AND num_rec_ulbid = :ulbId
      ORDER BY
        var_rec_receiptno -- Optional: Order by receipt number for consistent results
    `;

    // 4. Define Bind Parameters
    const binds = {
      departmentId: { val: parsedDepartmentId, type: oracledb.NUMBER },
      receiptNo: { val: receiptNo.trim(), type: oracledb.STRING },
      ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
    };

    // 5. Execute the Query
    result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows
    });

  } catch (error) {
    console.error("Error fetching receipt details:", error);
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
        message: "Internal Server Error during fetching receipt details.",
        error: clientError,
      });
    }
  } 
};

module.exports = getReceiptDetails;
