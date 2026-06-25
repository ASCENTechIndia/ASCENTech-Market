// const oracledb = require("oracledb");
// const { getConnection } = require("../../../config/database"); 

// const getCertificateGenReport = async (req, res) => {
//   let connection;
//   let result;

//   try {
//     const { appliId, ulbId } = req.body;

//     if (!appliId || !ulbId) {
//       console.error("Validation Error: Missing required parameters in request body (appliId, ulbId).");
//       return res.status(400).json({ success: false, message: "appliId and ulbId are mandatory." });
//     }

//     const parsedAppliId = parseInt(appliId, 10);
//     if (isNaN(parsedAppliId)) {
//       console.error(`Validation Error: Invalid appliId: ${appliId}. Expected a number.`);
//       return res.status(400).json({ success: false, message: `Invalid format for appliId: ${appliId}. Expected a number.` });
//     }

//     const parsedUlbId = parseInt(ulbId, 10);
//     if (isNaN(parsedUlbId)) {
//       console.error(`Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`);
//       return res.status(400).json({ success: false, message: `Invalid format for ulbId: ${ulbId}. Expected a number.` });
//     }

//     connection = await getConnection();

//     const sqlQuery = `
//       SELECT *
//       FROM view_certificategenrpt
//       WHERE appliid = :appliId
//       AND ulbid = :ulbId
//     `;

//     const binds = {
//       appliId: { val: parsedAppliId, type: oracledb.NUMBER },
//       ulbId: { val: parsedUlbId, type: oracledb.NUMBER },
//     };

//     result = await connection.execute(sqlQuery, binds, {
//       outFormat: oracledb.OUT_FORMAT_OBJECT, 
//     });

//     if (result.rows.length === 0) {
//       console.log(`No certificate generation report details found for Appli ID: ${appliId}, ULB ID: ${ulbId}`);
//       return res.status(404).json({
//         success: false,
//         message: "No certificate generation report details found for the provided criteria.",
//       });
//     }

//     res.status(200).json({
//       data: result.rows
//     });

//   } catch (error) {
//     console.error("Error fetching certificate generation report details:", error);
//     if (connection) {
//       try {
//         await connection.rollback(); // Rollback on error
//         console.log("Transaction rolled back due to error.");
//       } catch (rollbackError) {
//         console.error('Error during rollback:', rollbackError);
//       }
//     }
//     if (!res.headersSent) {
//       const clientError = {
//         message: error.message || "An unexpected internal server error occurred.",
//       };
//       if (error.code) {
//         clientError.code = error.code;
//       }
//       if (error.errorNum) {
//         clientError.oracleErrorNum = error.errorNum;
//       }
//       res.status(500).json({
//         success: false,
//         message: "Internal Server Error during fetching certificate generation report details.",
//         error: clientError,
//       });
//     }
//   }
// };

// module.exports = getCertificateGenReport;





const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getCertificateGenReport = async (req, res) => {
  let connection;

  try {
    const { ulbId } = req.body;

    if (!ulbId) {
      console.error("Validation Error: Missing ulbId in request body.");
      return res.status(400).json({
        success: false,
        message: "ulbId is required.",
      });
    }

    const parsedUlbId = parseInt(ulbId, 10);
    if (isNaN(parsedUlbId)) {
      console.error(`Validation Error: Invalid ulbId: ${ulbId}. Expected a number.`);
      return res.status(400).json({
        success: false,
        message: `Invalid format for ulbId: ${ulbId}. Expected a number.`,
      });
    }

    connection = await getConnection();

    const sqlQuery = `
      SELECT * 
      FROM view_certificategenrpt
      WHERE ulbid = :ulbId
    `;

    const binds = { ulbId: { val: parsedUlbId, type: oracledb.NUMBER } };

    const result = await connection.execute(sqlQuery, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (result.rows.length === 0) {
      console.log(`No records found for ULB ID: ${ulbId}`);
      return res.status(404).json({
        success: false,
        message: "No records found for the provided ULB ID.",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows,
    });

  } catch (error) {
    console.error("Error fetching certificate generation report details:", error);

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error while fetching certificate generation report.",
        error: error.message || error,
      });
    }
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

module.exports = getCertificateGenReport;
