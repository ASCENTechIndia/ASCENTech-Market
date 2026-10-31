const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const aomk_serviceaccmap_ins = async (req, res) => {
  let connection;

  try {
    const {
      in_UserId,
      in_ServiceaccmapId,
      in_Ulbid,
      in_Servid,
      in_GlCode,
      in_AccNo,
      in_Mode,
      in_ipaddress,
      in_source
    } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        aomk_serviceaccmap_ins(
          :in_UserId,
          :in_ServiceaccmapId,
          :in_Ulbid,
          :in_Servid,
          :in_GlCode,
          :in_AccNo,
          :in_Mode,
          :in_ipaddress,
          :in_source,
          :out_ErrorCode,
          :out_ErrorMsg
        );
      END;
      `,
      {
        in_UserId: { val: in_UserId, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_ServiceaccmapId: { val: in_ServiceaccmapId, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_Ulbid: { val: in_Ulbid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_Servid: { val: in_Servid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_GlCode: { val: in_GlCode, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_AccNo: { val: in_AccNo, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_Mode: { val: in_Mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_ipaddress: { val: in_ipaddress, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_source: { val: in_source, dir: oracledb.BIND_IN, type: oracledb.STRING },
        out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      }
    );

    res.status(200).json({
      success: true,
      errorcode: result.outBinds.out_ErrorCode,
      errormsg: result.outBinds.out_ErrorMsg
    });

  } catch (err) {
    console.error("Error in aomkServiceAccMapIns:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing DB connection:", closeErr);
      }
    }
  }
};

module.exports = aomk_serviceaccmap_ins











// const oracledb = require("oracledb");
// const { getConnection } = require("../../../config/database"); 


// const aomk_serviceaccmap_ins = async (req, res) => {
//     let connection;
//     let out_ErrorCode = -110; 
//     let out_ErrorMsg = 'UnSuccess!';
//     // ErrorLineNo is for PL/SQL's DBMS_UTILITY.FORMAT_ERROR_BACKTRACE, not directly applicable in JS.

//     try {
//         // 1. Extract parameters from request body using the EXACT PL/SQL parameter names
//         const {
//             in_UserId,
//             in_ServiceaccmapId, // This can be null for inserts (Mode 1)
//             in_Ulbid,
//             in_Servid,
//             in_GlCode,
//             in_AccNo,
//             in_Mode,
//             in_ipaddress,
//             in_source
//         } = req.body;

//         // 2. Node.js-side Validation (mirroring PL/SQL's initial checks)
//         // Using the exact parameter names as variables.
//         if (!in_UserId || in_UserId.trim() === '') { // PL/SQL checks '' or IS NULL
//             out_ErrorCode = -111; out_ErrorMsg = 'User Id Can Not Be Blank Or Null';
//             return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//         }
//         // For NUMBER types in PL/SQL, check for undefined, null, or if it's not a valid number.
//         if (in_Ulbid === undefined || in_Ulbid === null || isNaN(in_Ulbid)) {
//             out_ErrorCode = -112; out_ErrorMsg = 'Ulb Name Can Not Be Blank Or Null';
//             return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//         }
//         if (in_Servid === undefined || in_Servid === null || isNaN(in_Servid)) {
//             out_ErrorCode = -113; out_ErrorMsg = 'Service Id Can Not Be Blank Or Null';
//             return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//         }
//         if (!in_GlCode || in_GlCode.trim() === '') {
//             out_ErrorCode = -114; out_ErrorMsg = 'GlCode Can Not Be Blank Or Null';
//             return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//         }
//         if (!in_AccNo || in_AccNo.trim() === '') {
//             out_ErrorCode = -115; out_ErrorMsg = 'Account Number Can Not Be Blank Or Null';
//             return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//         }
//         if (in_Mode === undefined || in_Mode === null || isNaN(in_Mode)) {
//             out_ErrorCode = -116; out_ErrorMsg = 'Mode Can Not Be Blank Or Null';
//             return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//         }

//         // Connect to the database
//         connection = await getConnection();
//         // Optional: Set transaction isolation level for consistency
//         await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');

//         // --- Translate PL/SQL's Main Logic (IF in_Mode = 1 / ELSIF in_Mode = 2) ---
//         const parsed_in_Mode = parseInt(in_Mode, 10);

//         if (parsed_in_Mode === 1) { // Mode = 1 (Insert Logic)
//             // PL/SQL: BEGIN ... SELECT ... EXCEPTION WHEN NO_DATA_FOUND THEN ... INSERT
//             try {
//                 // Check if record with same Servid and Ulbid already exists
//                 const checkExistenceSql = `
//                     SELECT num_serviceAccmap_id
//                     FROM aomk_serviceaccmap_det
//                     WHERE num_serviceAccmapp_servid = :in_Servid
//                     AND num_serviceAccmap_ulbid = :in_Ulbid
//                 `;
//                 const checkExistenceResult = await connection.execute(
//                     checkExistenceSql,
//                     { in_Servid: parseInt(in_Servid, 10), in_Ulbid: parseInt(in_Ulbid, 10) },
//                     { outFormat: oracledb.OUT_FORMAT_OBJECT }
//                 );

//                 if (checkExistenceResult.rows.length > 0) {
//                     out_ErrorCode = -117; out_ErrorMsg = 'Record Already exits'; // Exact message from PL/SQL
//                     await connection.rollback(); // Rollback any implicit actions
//                     return res.status(409).json({ out_ErrorCode, out_ErrorMsg }); // 409 Conflict for "already exists"
//                 }
//             } catch (err) {
//                 // This catch handles errors from the SELECT statement itself, not NO_DATA_FOUND.
//                 // NO_DATA_FOUND would result in checkExistenceResult.rows.length === 0,
//                 // which is handled in the if-else block.
//                 console.error("Error during existence check (Mode 1):", err);
//                 throw err; // Re-throw to be caught by the main catch block
//             }

//             // If no record found, proceed with insertion
//             const nextValSql = `SELECT sq_servaccmapid.NEXTVAL FROM dual`;
//             const nextValResult = await connection.execute(nextValSql, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });
//             const v_servaamapid = nextValResult.rows[0].NEXTVAL; // Get the sequence value

//             const insertSql = `
//                 INSERT INTO aomk_serviceaccmap_det (
//                     num_serviceAccmap_id, num_serviceAccmap_ulbid, num_serviceAccmapp_servid,
//                     var_serviceAccmap_glcode, var_serviceAccmap_accno, var_serviceAccmap_insby,
//                     dat_serviceAccmap_insdate, var_serviceAccmap_updby, dat_serviceAccmap_upddate
//                 ) VALUES (
//                     :v_servaamapid, :in_Ulbid, :in_Servid, :in_GlCode, :in_AccNo, :in_UserId, SYSDATE, NULL, NULL
//                 )
//             `;
//             await connection.execute(insertSql, {
//                 v_servaamapid: v_servaamapid,
//                 in_Ulbid: parseInt(in_Ulbid, 10),
//                 in_Servid: parseInt(in_Servid, 10),
//                 in_GlCode: in_GlCode,
//                 in_AccNo: in_AccNo,
//                 in_UserId: in_UserId
//             });

//             out_ErrorCode = 9999;
//             out_ErrorMsg = 'Record Inserted Successfully!';

//         } else if (parsed_in_Mode === 2) { // Mode = 2 (Update Logic)
//             // PL/SQL: IF in_ServiceaccmapId is null THEN ... RETURN
//             if (in_ServiceaccmapId === undefined || in_ServiceaccmapId === null || isNaN(in_ServiceaccmapId)) {
//                 out_ErrorCode = -118; out_ErrorMsg = 'Error Code : ' + out_ErrorCode + ' - Parameter Service Map Id is not set';
//                 return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//             }

//             // PL/SQL: BEGIN ... SELECT ... EXCEPTION WHEN NO_DATA_FOUND THEN ... UPDATE
//             try {
//                 // Check if a DIFFERENT record with the same unique combination (Servid, Ulbid, GlCode, AccNo) exists
//                 const checkDuplicateSql = `
//                     SELECT num_serviceAccmap_id
//                     FROM aomk_serviceaccmap_det
//                     WHERE num_serviceAccmapp_servid = :in_Servid
//                     AND num_serviceAccmap_ulbid = :in_Ulbid
//                     AND var_serviceAccmap_glcode = :in_GlCode
//                     AND var_serviceAccmap_accno = :in_AccNo
//                     AND num_serviceAccmap_id != :in_ServiceaccmapId -- Exclude the current record being updated
//                 `;
//                 const checkDuplicateResult = await connection.execute(
//                     checkDuplicateSql,
//                     {
//                         in_Servid: parseInt(in_Servid, 10),
//                         in_Ulbid: parseInt(in_Ulbid, 10),
//                         in_GlCode: in_GlCode,
//                         in_AccNo: in_AccNo,
//                         in_ServiceaccmapId: parseInt(in_ServiceaccmapId, 10)
//                     },
//                     { outFormat: oracledb.OUT_FORMAT_OBJECT }
//                 );

//                 if (checkDuplicateResult.rows.length > 0) {
//                     out_ErrorCode = -117; out_ErrorMsg = 'Record Already exits'; // Exact message from PL/SQL for duplicate
//                     await connection.rollback();
//                     return res.status(409).json({ out_ErrorCode, out_ErrorMsg }); // 409 Conflict
//                 }
//             } catch (err) {
//                 console.error("Error during duplicate check (Mode 2):", err);
//                 throw err;
//             }

//             // If no duplicates found, proceed with update
//             const updateSql = `
//                 UPDATE aomk_serviceaccmap_det
//                 SET
//                     var_serviceAccmap_glcode = :in_GlCode,
//                     var_serviceAccmap_accno = :in_AccNo,
//                     var_serviceaccmap_updby = :in_UserId,
//                     dat_serviceaccmap_upddate = SYSDATE
//                 WHERE
//                     num_serviceaccmap_id = :in_ServiceaccmapId
//             `;
//             const updateResult = await connection.execute(updateSql, {
//                 in_GlCode: in_GlCode,
//                 in_AccNo: in_AccNo,
//                 in_UserId: in_UserId,
//                 in_ServiceaccmapId: parseInt(in_ServiceaccmapId, 10)
//             });

//             if (updateResult.rowsAffected === 0) {
//                 // This means no record was found with the given in_ServiceaccmapId to update
//                 out_ErrorCode = -119; // Custom code for "not found for update"
//                 out_ErrorMsg = 'Record not found for update.';
//                 await connection.rollback();
//                 return res.status(404).json({ out_ErrorCode, out_ErrorMsg });
//             } else {
//                 out_ErrorCode = 9999;
//                 out_ErrorMsg = 'Record Updated Successfully!';
//             }

//         } else {
//             out_ErrorCode = -120; // Custom code for invalid mode
//             out_ErrorMsg = 'Invalid Mode specified.';
//             await connection.rollback();
//             return res.status(400).json({ out_ErrorCode, out_ErrorMsg });
//         }

//         // PL/SQL: COMMIT; RETURN;
//         await connection.commit();

//         res.status(200).json({
//             out_ErrorCode,
//             out_ErrorMsg,
//         });

//     } catch (err) {
//         // PL/SQL: EXCEPTION when others THEN ROLLBACK; ... admins.aoma_error_log_ins; COMMIT; RETURN;
//         console.error('Error in aomkServiceAccMapIns (Node.js Rewrite):', err);

//         // Ensure rollback on any unhandled Node.js/DB driver error
//         if (connection) {
//             try {
//                 await connection.rollback();
//             } catch (rbErr) {
//                 console.error('Error during rollback:', rbErr);
//             }
//         }
        
//         // Replicate error logging if desired (as the PL/SQL does it on WHEN OTHERS)
//         // Note: You'd need to create a Node.js function for admins.aoma_error_log_ins or call the procedure.
//         // For simplicity and per previous instructions to not add error logging to DB, I'm omitting this part here.
//         // If you want this, uncomment and implement:
//         /*
//         if (connection) {
//             try {
//                 // Example of logging to DB from Node.js (requires connection & procedure call)
//                 await connection.execute(
//                     `BEGIN admins.aoma_error_log_ins(:in_Ulbid, :in_UserId, 'aomkServiceAccMapIns_NodeJS', :error_code, :sql_code, :sql_errm, :error_line); END;`,
//                     {
//                         in_Ulbid: req.body.in_Ulbid || null,
//                         in_UserId: req.body.in_UserId || 'API_USER_RW',
//                         error_code: err.errorNum || -1,
//                         sql_code: err.errorNum || -1, // Use errorNum for Oracle error codes
//                         sql_errm: (err.message || 'Unknown error').substring(0, 200),
//                         error_line: 'JS_RUNTIME_ERROR' // Or capture JS stack info
//                     }
//                 );
//                 await connection.commit(); // Commit the error log
//             } catch (logErr) {
//                 console.error('Error during error logging:', logErr);
//             }
//         }
//         */

//         // Return a generic error response for unhandled exceptions
//         res.status(500).json({
//             out_ErrorCode: -110, // Matching PL/SQL's general 'UnSuccess!'
//             out_ErrorMsg: 'Failed to process service account mapping due to an internal error.',
//             details: err.message
//         });

//     } finally {
//         if (connection) {
//             try {
//                 await connection.close(); // Always close connection
//             } catch (closeErr) {
//                 console.error('Error closing connection in aomkServiceAccMapIns:', closeErr);
//             }
//         }
//     }
// };

// module.exports = aomk_serviceaccmap_ins