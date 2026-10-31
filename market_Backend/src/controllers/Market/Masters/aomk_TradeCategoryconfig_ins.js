// controllers/tradeCategoryConfigController.js
const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); // Adjust this path

const aomk_TradeCategoryconfig_ins = async (req, res) => {
  let connection;

  try {
    const {
      in_UserId,
      in_Orgid,
      in_str,
      in_Mode,
      in_ipaddress,
      in_source,
    } = req.body;

    // Validation
    if (!in_UserId || typeof in_UserId !== "string") {
      return res.status(400).json({ success: false, message: "Missing or invalid 'in_UserId'" });
    }

    if (!in_Orgid || isNaN(Number(in_Orgid))) {
      return res.status(400).json({ success: false, message: "Missing or invalid 'in_Orgid'" });
    }

    if (!in_str || typeof in_str !== "string" || in_str.trim() === "") {
      return res.status(400).json({ success: false, message: "Missing or invalid 'in_str'" });
    }

    if (![1, 2].includes(Number(in_Mode))) {
      return res.status(400).json({ success: false, message: "Invalid 'in_Mode'. Must be 1 or 2." });
    }

    if (!in_ipaddress || typeof in_ipaddress !== "string") {
      return res.status(400).json({ success: false, message: "Missing or invalid 'in_ipaddress'" });
    }

    if (!in_source || typeof in_source !== "string") {
      return res.status(400).json({ success: false, message: "Missing or invalid 'in_source'" });
    }

    connection = await getConnection();

    // PL/SQL block using string interpolation (inputs not binded)
    const plsql = `
      DECLARE
        Out_Errorcode NUMBER;
        Out_Errormsg  VARCHAR2(500);
      BEGIN
        aomk_TradeCategoryconfig_ins(
          in_UserId      => '${in_UserId}',
          in_Orgid       => ${in_Orgid},
          in_str         => '${in_str.replace(/'/g, "''")}',
          in_Mode        => ${in_Mode},
          in_ipaddress   => '${in_ipaddress}',
          in_source      => '${in_source}',
          Out_Errorcode  => Out_Errorcode,
          Out_ErrorMsg   => Out_Errormsg
        );
        :out_errorcode := Out_Errorcode;
        :out_errormsg  := Out_Errormsg;
      END;
    `;

    const result = await connection.execute(plsql, {
      out_errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
    });

    const outCode = result.outBinds.out_errorcode;
    const outMsg = result.outBinds.out_errormsg;

    if (outCode === 9999) {
      return res.status(200).json({
        success: true,
        message: outMsg,
        errorCode: outCode,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: outMsg,
        errorCode: outCode,
      });
    }
  } catch (error) {
    console.error("Error in aomk_TradeCategoryconfig_ins:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during Trade Category Configuration processing.",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

module.exports = aomk_TradeCategoryconfig_ins;










// const oracledb = require("oracledb");
// const { getConnection } = require("../../../config/database"); // Adjust path as per your project structure

// /**
//  * Node.js API to replicate the PL/SQL PROCEDURE aomk_TradeCategoryconfig_ins.
//  * This API handles insertion (Mode 1) and update/deactivation (Mode 2)
//  * of trade category configurations, including activity and error logging.
//  *
//  * @param {object} req - The Express request object, containing parameters in req.body.
//  * Expected body (using exact PL/SQL IN parameter names as keys):
//  * {
//  * "in_UserId": "SOMEUSERID",  // VARCHAR2 - in_UserId
//  * "in_Orgid": 5,              // NUMBER   - in_Orgid
//  * "in_str": "1#N#Y$2#Y#N",  // VARCHAR2 - in_str (format: "tradeCatId#previousStatus#currentStatus$...")
//  * "in_Mode": 1,               // NUMBER   - in_Mode (1 for Insert, 2 for Update/Deactivate)
//  * "in_ipaddress": "192.168.1.1", // VARCHAR2 - in_ipaddress
//  * "in_source": "WebApp"       // VARCHAR2 - in_source
//  * }
//  * @param {object} res - The Express response object, used to send the JSON data.
//  */
// const aomk_TradeCategoryconfig_ins = async (req, res) => { // Renamed function to match PL/SQL name
//   let connection;
//   let outErrorCode = -1;
//   let outErrorMsg = "UnSuccess";
//   // Declare these variables here to ensure they are always in scope for the catch block
//   let parsedOrgid = null;
//   let in_UserId = null;
//   let in_ipaddress = null;
//   let in_source = null;

//   try {
//     // 1. Extract and Validate Input Parameters from the request body
//     // Assign to the already-declared variables
//     ({ in_UserId, in_Orgid, in_str, in_Mode, in_ipaddress, in_source } = req.body);

//     // --- Basic Parameter Validation (Replicating PL/SQL checks) ---
//     if (!in_UserId || in_UserId.trim() === '') {
//       outErrorCode = -190;
//       outErrorMsg = 'Parameter UserId is not set'; // Keeping "UserId" in message for consistency with PL/SQL error
//       return res.status(400).json({ success: false, outErrorCode, outErrorMsg });
//     }
//     if (in_Orgid === null || in_Orgid === undefined || isNaN(Number(in_Orgid))) {
//       outErrorCode = -110;
//       outErrorMsg = 'Parameter ULB is not set'; // Keeping "ULB" in message for consistency with PL/SQL error
//       return res.status(400).json({ success: false, outErrorCode, outErrorMsg });
//     }
//     if (!in_str || in_str.trim() === '') {
//       outErrorCode = -140;
//       outErrorMsg = 'Parameter in_str is not set';
//       return res.status(400).json({ success: false, outErrorCode, outErrorMsg });
//     }
//     if (in_Mode === null || in_Mode === undefined || isNaN(Number(in_Mode))) {
//       outErrorCode = -110;
//       outErrorMsg = 'Parameter Mode is not set';
//       return res.status(400).json({ success: false, outErrorCode, outErrorMsg });
//     }
//     // End of basic validation

//     connection = await getConnection();
//     // Begin transaction for multiple DML operations
//     await connection.execute('SET TRANSACTION ISOLATION LEVEL READ COMMITTED'); // Or adjust as per your requirement
//     await connection.execute('ALTER SESSION SET NLS_DATE_FORMAT = \'DD-MON-YYYY HH24:MI:SS\''); // Ensure SYSDATE format for consistency


//     parsedOrgid = parseInt(in_Orgid, 10); // Assign parsedOrgid here
//     const parsedMode = parseInt(in_Mode, 10); // Using in_Mode

//     // Parse in_str into an array of objects
//     const items = in_str.split('$').map(itemStr => { // Using in_str
//       const parts = itemStr.split('#');
//       if (parts.length !== 3) {
//         throw new Error(`Invalid format for in_str segment: ${itemStr}. Expected 'tradeCatId#previousStatus#currentStatus'.`);
//       }
//       return {
//         tradeCatId: parseInt(parts[0], 10),
//         previousStatus: parts[1],
//         currentStatus: parts[2]
//       };
//     });

//     if (parsedMode === 1) { // --- INSERT MODE ---
//       console.log('Mode 1: Processing inserts for Trade Category Configuration...');
//       for (const item of items) {
//         let v_Tradecatconfig_id = null; // Initialize to null

//         try {
//           // Attempt to find existing record (equivalent to PL/SQL `SELECT INTO v_id`)
//           // FIX: Qualified with MARKET schema
//           const checkResult = await connection.execute(
//             `SELECT num_tradecatconf_id FROM MARKET.aomk_tradecatconfig_mas WHERE num_tradecatconf_tradecatid = :tradeCatId AND num_tradecatconf_ulbid = :orgId`,
//             { tradeCatId: item.tradeCatId, orgId: parsedOrgid },
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//           );

//           // If a record is found, it's not unique -> return error for the entire procedure
//           if (checkResult.rows.length > 0) {
//             outErrorCode = -120;
//             outErrorMsg = 'Trade Type Category should be unique for each organisation';
//             await connection.rollback();
//             return res.status(400).json({ success: false, outErrorCode, outErrorMsg });
//           }

//           // **PL/SQL Logic Replication**: If we reach here, it means NO_DATA_FOUND,
//           // so fetch the next sequence value and then proceed with the insert if statuses match.
//           // FIX: Qualified with MARKET schema
//           const seqResult = await connection.execute(`SELECT MARKET.sq_Tradecatconf_id.NEXTVAL AS NEXTVAL_ID FROM dual`);
          
//           // --- NEW LOGGING FOR DEBUGGING ---
//           console.log('Mode 1: Seq Result (full object):', seqResult);
//           console.log('Mode 1: Seq Result Rows:', seqResult.rows);
//           console.log('Mode 1: Seq Result First Row:', seqResult.rows[0]);
//           console.log('Mode 1: Keys in sequence result row:', seqResult.rows[0] ? Object.keys(seqResult.rows[0]) : 'No rows or first row is null');
//           console.log('Mode 1: Seq Result NEXTVAL_ID (attempted access):', seqResult.rows[0]?.NEXTVAL_ID);
//           // --- END NEW LOGGING ---

//           // CRITICAL FIX: Access the value using index [0] as it's returned as an array, not object
//           // Even with OUT_FORMAT_OBJECT, SELECT ... FROM dual sometimes returns array for single column
//           if (seqResult.rows.length === 0 || seqResult.rows[0][0] === null || seqResult.rows[0][0] === undefined) {
//               throw new Error(`Failed to retrieve valid sequence value for num_tradecatconf_id. Sequence returned: ${seqResult.rows[0]?.[0]}. Please check if the sequence 'MARKET.sq_Tradecatconf_id' exists and is accessible to your database user.`);
//           }
//           v_Tradecatconfig_id = seqResult.rows[0][0]; // FIX: Changed from .NEXTVAL_ID to [0]

//         } catch (err) {
//           // This catch block should only handle UNEXPECTED database errors during the SELECT or sequence fetch.
//           // ORA-01403 (no data found) is handled by `checkResult.rows.length > 0` condition.
//           // If any other critical database error occurs, re-throw it.
//           throw err;
//         }

//         // Now, after v_Tradecatconfig_id is guaranteed to be set if no existing record was found,
//         // proceed with the conditional insert if the statuses match.
//         if (item.previousStatus === 'N' && item.currentStatus === 'Y') {
//           // FIX: Qualified with MARKET schema
//           await connection.execute(
//             `INSERT INTO MARKET.aomk_tradecatconfig_mas (
//               num_tradecatconf_id, num_tradecatconf_tradecatid, num_tradecatconf_ulbid, var_tradecatconf_flag,
//               dat_tradecatconf_insdt, var_tradecatconf_insby, dat_tradecatconf_updt, var_tradecatconf_updby
//             ) VALUES (
//               :id, :tradeCatId, :orgId, 'Y', SYSDATE, :in_UserId, NULL, NULL
//             )`,
//             {
//               id: v_Tradecatconfig_id, // This should now always be correctly populated
//               tradeCatId: item.tradeCatId,
//               orgId: parsedOrgid,
//               in_UserId: in_UserId
//             }
//           );
//         }
//       } // End of for loop

//       // Log activity
//       // FIX: Qualified with ADMINS schema
//       await connection.execute(
//         `BEGIN ADMINS.aoma_activity_log_ins(:orgId, :in_UserId, 'Trade Type Category Configuration', 'Authorize', 'inserted Trade Type Category Configuration Org:' || :orgId, :in_ipaddress, :in_source); END;`,
//         {
//           orgId: parsedOrgid,
//           in_UserId: in_UserId,
//           in_ipaddress: in_ipaddress,
//           in_source: in_source
//         }
//       );

//       outErrorCode = 9999;
//       outErrorMsg = 'Trade Type Category Configuration Inserted Successfully!';

//     } else if (parsedMode === 2) { // --- UPDATE/DEACTIVATE MODE ---
//       console.log('Mode 2: Processing updates/deactivations for Trade Category Configuration...');
//       for (const item of items) {
//         if (item.previousStatus === 'Y' && item.currentStatus === 'N') {
//           // Deactivate (update flag to 'N')
//           // FIX: Qualified with MARKET schema
//           await connection.execute(
//             `UPDATE MARKET.aomk_tradecatconfig_mas SET
//               var_tradecatconf_flag = 'N',
//               dat_tradecatconf_updt = SYSDATE,
//               var_tradecatconf_updby = :in_UserId
//             WHERE num_tradecatconf_ulbid = :orgId AND num_tradecatconf_tradecatid = :tradeCatId`,
//             {
//               in_UserId: in_UserId,
//               orgId: parsedOrgid,
//               tradeCatId: item.tradeCatId
//             }
//           );
//         } else if (item.previousStatus === 'N' && item.currentStatus === 'Y') {
//           // **PL/SQL Logic Replication**: Directly fetch sequence and insert, no pre-check.
//           // FIX: Qualified with MARKET schema
//           const seqResult = await connection.execute(`SELECT MARKET.sq_Tradecatconf_id.NEXTVAL AS NEXTVAL_ID FROM dual`);
          
//           // --- NEW LOGGING FOR DEBUGGING ---
//           console.log('Mode 2: Seq Result (full object):', seqResult);
//           console.log('Mode 2: Seq Result Rows:', seqResult.rows);
//           console.log('Mode 2: Seq Result First Row:', seqResult.rows[0]);
//           console.log('Mode 2: Keys in sequence result row:', seqResult.rows[0] ? Object.keys(seqResult.rows[0]) : 'No rows or first row is null');
//           console.log('Mode 2: Seq Result NEXTVAL_ID (attempted access):', seqResult.rows[0]?.NEXTVAL_ID);
//           // --- END NEW LOGGING ---

//           // CRITICAL FIX: Access the value using index [0] as it's returned as an array, not object
//           if (seqResult.rows.length === 0 || seqResult.rows[0][0] === null || seqResult.rows[0][0] === undefined) {
//               throw new Error(`Failed to retrieve valid sequence value for num_tradecatconf_id in Mode 2. Sequence returned: ${seqResult.rows[0]?.[0]}. Please check if the sequence 'MARKET.sq_Tradecatconf_id' exists and is accessible.`);
//           }
//           const v_Tradecatconfig_id = seqResult.rows[0][0]; // FIX: Changed from .NEXTVAL_ID to [0]

//           // FIX: Qualified with MARKET schema
//           await connection.execute(
//             `INSERT INTO MARKET.aomk_tradecatconfig_mas (
//               num_tradecatconf_id, num_tradecatconf_tradecatid, num_tradecatconf_ulbid, var_tradecatconf_flag,
//               dat_tradecatconf_insdt, var_tradecatconf_insby, dat_tradecatconf_updt, var_tradecatconf_updby
//             ) VALUES (
//               :id, :tradeCatId, :orgId, 'Y', SYSDATE, :in_UserId, NULL, NULL
//             )`,
//             {
//               id: v_Tradecatconfig_id,
//               tradeCatId: item.tradeCatId,
//               orgId: parsedOrgid,
//               in_UserId: in_UserId
//             }
//           );
//         }
//       }

//       // Delete records where flag is 'N' after processing all updates
//       // FIX: Qualified with MARKET schema
//       await connection.execute(
//         `DELETE FROM MARKET.aomk_tradecatconfig_mas WHERE var_tradecatconf_flag = 'N' AND num_tradecatconf_ulbid = :orgId`,
//         { orgId: parsedOrgid }
//       );

//       // Log activity
//       // FIX: Qualified with ADMINS schema
//       await connection.execute(
//         `BEGIN ADMINS.aoma_activity_log_ins(:orgId, :in_UserId, 'Trade Type Category Configuration', 'Authorize', 'Updated Trade Type Category Configuration Org:' || :orgId, :in_ipaddress, :in_source); END;`,
//         {
//           orgId: parsedOrgid,
//           in_UserId: in_UserId,
//           in_ipaddress: in_ipaddress,
//           in_source: in_source
//         }
//       );

//       outErrorCode = 9999;
//       outErrorMsg = 'Trade Type Category Configuration Updated Successfully!';
//     } else {
//       outErrorCode = -1; // Or a more specific error code for invalid mode
//       outErrorMsg = 'Invalid mode provided. Mode must be 1 (Insert) or 2 (Update/Deactivate).';
//       await connection.rollback();
//       return res.status(400).json({ success: false, outErrorCode, outErrorMsg });
//     }

//     await connection.commit(); // Commit the transaction
//     console.log(`Transaction committed successfully for mode ${parsedMode}.`);

//     return res.status(200).json({ success: true, outErrorCode, outErrorMsg });

//   } catch (error) {
//     console.error('Error in aomk_TradeCategoryconfig_ins:', error);
//     if (connection) {
//       try {
//         await connection.rollback(); // Rollback on error
//         console.log("Transaction rolled back due to error.");
//       } catch (rollbackError) {
//         console.error("Error during rollback:", rollbackError);
//       }
//     }

//     // Log error using aoma_error_log_ins (if it's not the cause of the current error)
//     // FIX: Qualified with ADMINS schema
//     if (connection && error.code !== 'ORA-06512' && error.code !== 'ORA-04068') {
//         try {
//             let errorLineNo = null; // Default to null
//             if (error.stack) {
//                 const stackLines = error.stack.split('\n');
//                 // Attempt to find a line that includes 'at async Connection.execute' and extract line number
//                 const relevantStackLine = stackLines.find(line => line.includes('at async Connection.execute'));
//                 if (relevantStackLine) {
//                     const match = /:(\d+):\d+\)/.exec(relevantStackLine);
//                     if (match && match[1]) {
//                         errorLineNo = match[1];
//                     }
//                 }
//             }

//             await connection.execute(
//                 `BEGIN ADMINS.aoma_error_log_ins(:orgId, :in_UserId, 'aomk_TradeCategoryconfig_ins', :outErrorCode, :sqlCode, :sqlErrorM, :errorLineNo); END;`,
//                 {
//                     orgId: parsedOrgid, // Now guaranteed to be defined (or null if parsing failed)
//                     in_UserId: in_UserId, // Now guaranteed to be defined (or null)
//                     outErrorCode: outErrorCode,
//                     sqlCode: error.errorNum || (error.code ? parseInt(error.code.replace('ORA-', ''), 10) : -20000),
//                     sqlErrorM: error.message ? error.message.substring(0, 200) : 'Unknown error',
//                     errorLineNo: errorLineNo
//                 }
//             );
//             await connection.commit();
//             console.log("Error logged to aoma_error_log_ins.");
//         } catch (logError) {
//             console.error('CRITICAL: Error logging to aoma_error_log_ins:', logError);
//         }
//     }

//     // Prepare client-facing error response
//     outErrorCode = error.errorNum || (error.code ? parseInt(error.code.replace('ORA-', ''), 10) : -110);
//     outErrorMsg = error.message || 'An unexpected internal server error occurred.';
//     if (error.code === 'ORA-01403') { // This specific error is handled for uniqueness checks earlier
//         outErrorMsg = 'No data found in database (or specific query criteria not met).';
//     }

//     if (!res.headersSent) {
//       res.status(500).json({
//         success: false,
//         outErrorCode,
//         outErrorMsg,
//         details: error.message // Provide details for easier debugging
//       });
//     }
//   } finally {
//     if (connection) {
//       try {
//         await connection.close();
//         console.log("Database connection closed.");
//       } catch (closeError) {
//         console.error("Error closing database connection:", closeError);
//       }
//     }
//   }
// };

// module.exports = aomk_TradeCategoryconfig_ins;