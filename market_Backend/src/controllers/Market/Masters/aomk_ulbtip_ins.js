const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database"); // Assuming this path is correct for your project

const aomk_ulbtip_ins = async (req, res, next) => {
    let connection;
    try {
        // --- Input Validation based on the Oracle Procedure's IN parameters ---

        // In_UserId validation
        if (!req.body.in_userid || typeof req.body.in_userid !== 'string' || req.body.in_userid.trim() === '') {
            console.error('Validation Error: in_userid is missing or invalid.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter UserId is not set.'
            });
        }

        // In_ulbid validation
        if (req.body.in_ulbid === undefined || req.body.in_ulbid === null || typeof req.body.in_ulbid !== 'number') {
            console.error('Validation Error: in_ulbid is missing or not a number.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter ulbid is not set or invalid type.'
            });
        }

        // In_tip validation
        // Note: Oracle LONG type can handle large strings, Node.js strings map fine.
        if (!req.body.in_tip || typeof req.body.in_tip !== 'string' || req.body.in_tip.trim() === '') {
            console.error('Validation Error: in_tip is missing or invalid.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter tip is not set.'
            });
        }

        // In_slogan validation
        // Note: Oracle LONG type can handle large strings, Node.js strings map fine.
        if (!req.body.in_slogan || typeof req.body.in_slogan !== 'string' || req.body.in_slogan.trim() === '') {
            console.error('Validation Error: in_slogan is missing or invalid.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter slogan is not set.'
            });
        }

        // In_status validation (optional based on requirement, assuming 'Y'/'N' or similar)
        if (!req.body.in_status || typeof req.body.in_status !== 'string' || !['Y', 'N'].includes(req.body.in_status.toUpperCase())) {
             // Default to 'Y' if not provided or invalid, but log a warning.
            console.warn('Validation Warning: in_status is missing or invalid. Defaulting to "Y".');
            req.body.in_status = 'Y'; 
        }

        // In_mode validation (must be 1 or 2)
        if (req.body.in_mode === undefined || req.body.in_mode === null || ![1, 2].includes(req.body.in_mode)) {
            console.error('Validation Error: in_mode is missing or invalid. Must be 1 (Insert) or 2 (Update).');
            return res.status(400).json({
                Out_Errorcode: -191, // Custom error code for mode validation
                Out_Errormsg: 'Parameter Mode (in_mode) must be 1 for Insert or 2 for Update.'
            });
        }

        connection = await getConnection();

        const sql = `
            BEGIN
              aomk_ulbtip_ins(
                in_userid       => :inUserId,
                in_ulbid        => :inUlbid,
                in_tip          => :inTip,
                in_slogan       => :inSlogan,
                in_status       => :inStatus,
                in_ipaddress    => :inIpaddress,
                in_source       => :inSource,
                in_mode         => :inMode,
                out_errorcode   => :outErrorcode,
                out_errormsg    => :outErrormsg
              );
            END;
        `;

        const binds = {
            inUserId: req.body.in_userid,
            inUlbid: req.body.in_ulbid,
            inTip: req.body.in_tip,
            inSlogan: req.body.in_slogan,
            inStatus: req.body.in_status.toUpperCase(), // Ensure 'Y' or 'N' is uppercase for consistency
            inIpaddress: req.ip || '127.0.0.1', // Get client IP or default to localhost
            inSource: req.body.in_source || 'NODEJS_API', // Default source if not provided
            inMode: req.body.in_mode,
            outErrorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            outErrormsg: { dir: oracledb.BIND_OUT, type: oracledb.VARCHAR2, maxSize: 500 }
        };

        // Auto-commit is generally false for DML operations.
        // We will manually commit/rollback based on procedure's output.
        const options = {
            autoCommit: false
        };

        const result = await connection.execute(sql, binds, options);

        const outErrorcode = result.outBinds.outErrorcode;
        const outErrormsg = result.outBinds.outErrormsg;

        if (outErrorcode === 9999) {
            await connection.commit(); // Commit transaction on success
            res.status(200).json({
                Out_Errorcode: outErrorcode,
                Out_Errormsg: outErrormsg
            });
        } else {
            await connection.rollback(); // Rollback transaction on procedure error
            console.error(`Oracle Procedure Error: Code ${outErrorcode}, Message: ${outErrormsg}`);
            // Use 400 for client-side errors based on procedure's business logic
            res.status(400).json({
                Out_Errorcode: outErrorcode,
                Out_Errormsg: outErrormsg
            });
        }

    } catch (err) {
        console.error('Error in aomk_ulbtip_ins (route handler):', err);
        // Rollback any pending transaction if a JavaScript error occurred
        if (connection) {
            try {
                await connection.rollback();
                console.log('Transaction rolled back due to application error.');
            } catch (rollbackErr) {
                console.error('Error during rollback:', rollbackErr);
            }
        }
        // Send a 500 Server Error response
        res.status(500).json({
            Out_Errorcode: -999, // General server error code
            Out_Errormsg: `Server Error: ${err.message}`
        });
    } finally {
        // Ensure connection is closed whether successful or not
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed.');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

module.exports = aomk_ulbtip_ins;
















// const oracledb = require("oracledb");
// const { getConnection } = require("../../../config/database"); 

// const aomk_ulbtip_ins = async (req, res) => {
//     let connection;
//     try {
//         // Extract parameters from the request body, matching PL/SQL names
//         const {
//             in_userid,
//             in_ulbid,
//             in_tip,
//             in_slogan,
//             in_status, // This parameter is passed but not used directly in PL/SQL, 'Y' is hardcoded for new inserts
//             in_ipaddress,
//             in_source,
//             in_mode
//         } = req.body;

//         // --- Node.js-side Validation (replicated from PL/SQL) ---
//         if (!in_userid || in_userid.trim() === '') {
//             return res.status(400).json({
//                 errorCode: -190,
//                 message: 'Parameter UserId is not set'
//             });
//         }

//         if (in_ulbid === undefined || in_ulbid === null || isNaN(in_ulbid)) {
//             return res.status(400).json({
//                 errorCode: -190, // Reusing error code as per PL/SQL
//                 message: 'Parameter ulbid is not set or is invalid'
//             });
//         }

//         if (!in_tip || in_tip.trim() === '') {
//             return res.status(400).json({
//                 errorCode: -190, // Reusing error code as per PL/SQL
//                 message: 'Parameter tip is not set'
//             });
//         }

//         if (!in_slogan || in_slogan.trim() === '') {
//             return res.status(400).json({
//                 errorCode: -190, // Reusing error code as per PL/SQL
//                 message: 'Parameter slogan is not set'
//             });
//         }

//         if (in_mode === undefined || isNaN(in_mode) || (in_mode !== 1 && in_mode !== 2)) {
//             return res.status(400).json({
//                 errorCode: -100, // Custom error code for invalid mode
//                 message: 'Parameter in_mode (1 for Insert, 2 for Update) is required and must be a number (1 or 2).'
//             });
//         }

//         connection = await getConnection();

//         // Transaction management: oracledb's execute defaults to auto-commit=false for DML,
//         // so explicit commit is needed. Rollback will be handled in catch.

//         let v_ulbtipid; // This will hold the new ID or be used for querying
//         let outErrorcode = 0;
//         let outErrormsg = '';

//         // Get the next ID by selecting MAX + 1. Note: This is NOT a sequence.
//         // This logic is prone to race conditions in high concurrency environments.
//         // If high concurrency is expected, consider using a proper Oracle SEQUENCE.
//         const maxIdResult = await connection.execute(
//             `SELECT NVL(MAX(num_ulbtip_id), 0) + 1 AS NEXT_ID FROM aomk_ulbtip_det`,
//             {},
//             { outFormat: oracledb.OUT_FORMAT_OBJECT }
//         );
//         v_ulbtipid = maxIdResult.rows[0].NEXT_ID;

//         if (in_mode === 1) { // --- Insert Mode ---
//             // The PL/SQL has a check for existing record using the newly generated ID
//             // and then checks for tip/slogan. This seems unusual (checking by new ID first).
//             // A more common pattern would be to check by tip/slogan for existence.
//             // Replicating the PL/SQL exact behavior:
//             const checkExistsSql = `
//                 SELECT var_ulbtip_tip, var_ulbtip_slogan
//                 FROM aomk_ulbtip_det
//                 WHERE num_ulbtip_id = :v_ulbtipid_param
//             `;
//             const checkResult = await connection.execute(
//                 checkExistsSql,
//                 { v_ulbtipid_param: v_ulbtipid },
//                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
//             );

//             if (checkResult.rows.length > 0) {
//                 // If a record already exists with this NEXT_ID (which is weird if it's NEXTVAL logic)
//                 // This implies a potential flaw in the PL/SQL's ID generation or an unusual scenario.
//                 // Or, more likely, the PL/SQL was trying to select by tip/slogan, but used v_ulbtipid by mistake.
//                 // Given the procedure: "Select num_ulbtip_id into v_ulbtipid from aomk_ulbtip_det where var_ulbtip_tip = v_ulbtip and var_ulbtip_slogan = v_ulbSolgan;"
//                 // This seems to be the INTENDED check (by name) not by the newly generated ID.
//                 // I will translate the INTENDED logic, which is checking by TIP and SLOGAN, not by the newly generated ID.
//                 // The PL/SQL's first SELECT uses `v_ulbtipid`, which is the *next* ID, so it will always be NO_DATA_FOUND.
//                 // The commented out `SELECT num_ulbtip_id into v_ulbtipid from aomk_ulbtip_det where var_ulbtip_tip = v_ulbtip and var_ulbtip_slogan = v_ulbSolgan;`
//                 // looks like the true intent. I will proceed with checking for duplicate TIP and SLOGAN for the current ULB.

//                 const actualExistenceCheckSql = `
//                     SELECT num_ulbtip_id
//                     FROM aomk_ulbtip_det
//                     WHERE UPPER(var_ulbtip_tip) = UPPER(:in_tip_param)
//                       AND UPPER(var_ulbtip_slogan) = UPPER(:in_slogan_param)
//                       AND num_ulbtip_ulbid = :in_ulbid_param
//                 `;
//                 const actualCheckResult = await connection.execute(
//                     actualExistenceCheckSql,
//                     {
//                         in_tip_param: in_tip,
//                         in_slogan_param: in_slogan,
//                         in_ulbid_param: in_ulbid
//                     },
//                     { outFormat: oracledb.OUT_FORMAT_OBJECT }
//                 );

//                 if (actualCheckResult.rows.length > 0) {
//                     outErrorcode = -120;
//                     outErrormsg = 'Record Already Present';
//                     await connection.rollback();
//                     return res.status(400).json({ errorCode: outErrorcode, message: outErrormsg });
//                 }
//             }


//             // If no existing record, insert the new one
//             const insertSql = `
//                 INSERT INTO aomk_ulbtip_det (
//                     num_ulbtip_id, num_ulbtip_ulbid, var_ulbtip_tip, var_ulbtip_slogan,
//                     var_ulbtip_active, var_ulbtip_insby, dat_ulbtip_insdate,
//                     var_ulbtip_updby, dat_ulbtip_upddate
//                 ) VALUES (
//                     :v_ulbtipid, :in_ulbid, :in_tip, :in_slogan, 'Y',
//                     :in_userid, SYSDATE, NULL, NULL
//                 )
//             `;
//             await connection.execute(insertSql, {
//                 v_ulbtipid: v_ulbtipid,
//                 in_ulbid: in_ulbid,
//                 in_tip: in_tip,
//                 in_slogan: in_slogan,
//                 in_userid: in_userid
//             });

//             // No explicit activity log for insert in PL/SQL, but I'll add one here as it's good practice.
//             // If you don't want this, remove the call below.
//             await connection.execute(
//                 `BEGIN ADMINS.aoma_activity_log_ins(:orgid, :userid, 'ULB Tip', 'INSERT', 'ULB Tip Id:' || :ulbTipId, :ipaddr, :source); END;`,
//                 {
//                     orgid: in_ulbid, // Using in_ulbid as orgid for logging context
//                     userid: in_userid,
//                     ulbTipId: v_ulbtipid,
//                     ipaddr: in_ipaddress || null,
//                     source: in_source || null
//                 }
//             );

//             outErrorcode = 9999;
//             outErrormsg = 'Record Saved Successfully';

//         } else if (in_mode === 2) { // --- Update Mode ---
//             // In update mode, the PL/SQL first sets all existing tips for the ULB to 'N' (inactive),
//             // then inserts the new tip as 'Y' (active). This effectively makes the new tip the active one.

//             // 1. Set all existing tips for this ULB to 'N'
//             const updateExistingSql = `
//                 UPDATE aomk_ulbtip_det
//                 SET
//                     var_ulbtip_active = 'N',
//                     var_ulbtip_updby = :in_userid,
//                     dat_ulbtip_upddate = SYSDATE
//                 WHERE num_ulbtip_ulbid = :in_ulbid
//             `;
//             await connection.execute(updateExistingSql, {
//                 in_userid: in_userid,
//                 in_ulbid: in_ulbid
//             });

//             // 2. Insert the new tip with the new ID and 'Y' status
//             const insertNewTipSql = `
//                 INSERT INTO aomk_ulbtip_det (
//                     num_ulbtip_id, num_ulbtip_ulbid, var_ulbtip_tip, var_ulbtip_slogan,
//                     var_ulbtip_active, var_ulbtip_insby, dat_ulbtip_insdate,
//                     var_ulbtip_updby, dat_ulbtip_upddate
//                 ) VALUES (
//                     :v_ulbtipid, :in_ulbid, :in_tip, :in_slogan, 'Y',
//                     :in_userid, SYSDATE, NULL, NULL
//                 )
//             `;
//             await connection.execute(insertNewTipSql, {
//                 v_ulbtipid: v_ulbtipid,
//                 in_ulbid: in_ulbid,
//                 in_tip: in_tip,
//                 in_slogan: in_slogan,
//                 in_userid: in_userid
//             });

//             // Log activity for update
//             await connection.execute(
//                 `BEGIN ADMINS.aoma_activity_log_ins(:orgid, :userid, 'ULB Tip', 'UPDATE', 'ULB Tip Inserted Id:' || :ulbTipId || ' (Previous set to Inactive)', :ipaddr, :source); END;`,
//                 {
//                     orgid: in_ulbid, // Using in_ulbid as orgid for logging context
//                     userid: in_userid,
//                     ulbTipId: v_ulbtipid,
//                     ipaddr: in_ipaddress || null,
//                     source: in_source || null
//                 }
//             );

//             outErrorcode = 9999;
//             outErrormsg = 'Record Updated Successfully';
//         }

//         await connection.commit(); // Commit the transaction
//         res.status(200).json({ errorCode: outErrorcode, message: outErrormsg });

//     } catch (err) {
//         // --- Handle any errors during the transaction ---
//         console.error('Error in aomk_ulbtip_ins_Node procedure:', err);
//         let errorLineNo = '';
//         if (err.stack) {
//             const stackLines = err.stack.split('\n');
//             const errorLine = stackLines.find(line => line.includes('at aomk_ulbtip_ins_Node'));
//             if (errorLine) {
//                 const match = errorLine.match(/:(\d+):\d+\)$/);
//                 if (match && match[1]) {
//                     errorLineNo = match[1];
//                 }
//             }
//         }
//         outErrorcode = -110; // General 'Unsuccess' code as per PL/SQL
//         outErrormsg = 'UnSuccess';

//         if (connection) {
//             try {
//                 await connection.rollback(); // Rollback transaction on error
//                 // Log error to Admins.Aoma_Error_Log_Ins (assuming it's a separate procedure/function)
//                 await connection.execute(
//                     `BEGIN Admins.Aoma_Error_Log_Ins(:orgid, :userid, 'aomk_ulbtip_ins_Node', :errorcode, :sqlcode, :sqlerrm, :errordetails); END;`,
//                     {
//                         orgid: req.body.in_ulbid || null, // Pass in_ulbid as orgid
//                         userid: req.body.in_userid || null,
//                         errorcode: outErrorcode,
//                         sqlcode: err.errorNum || -1, // Oracle error number
//                         sqlerrm: (err.message || 'Unknown error').substring(0, 200), // Truncate to 200 chars
//                         errordetails: `Errorline No:${errorLineNo}` // Pass Node.js error line
//                     }
//                 );
//                 await connection.commit(); // Commit the error log entry (important, as this is a separate DML)
//             } catch (rollbackErr) {
//                 console.error('Error during rollback or error logging in aomk_ulbtip_ins_Node:', rollbackErr);
//             }
//         }

//         res.status(500).json({
//             errorCode: outErrorcode,
//             message: outErrormsg,
//             details: err.message
//         });
//     } finally {
//         if (connection) {
//             try {
//                 await connection.close();
//             } catch (err) {
//                 console.error('Error closing connection in aomk_ulbtip_ins_Node finally block:', err);
//             }
//         }
//     }
// };

// module.exports =  aomk_ulbtip_ins