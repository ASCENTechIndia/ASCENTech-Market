// controllers/tradeCategoryController.js
const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database"); // Adjust the path accordingly

const Aomk_TradeCategory_Ins = async (req, res) => {
    let connection;

    try {
        const {
            In_Userid,
            In_Mode,
            In_TradeCategoryid,     // Optional for Insert (mode 1), required for Update (mode 2)
            In_TradeCategoryname,
            In_TradeCategoryflag,
            In_orgid,
            in_ipaddr,
            in_source
        } = req.body;

        // --- Input Validations ---
        if (!In_Userid || typeof In_Userid !== 'string' || In_Userid.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_Userid'." });
        }
        if (![1, 2].includes(Number(In_Mode))) {
            return res.status(400).json({ success: false, message: "Invalid 'In_Mode'. Must be 1 (Insert) or 2 (Update)." });
        }
        if (!In_TradeCategoryname || typeof In_TradeCategoryname !== 'string') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_TradeCategoryname'." });
        }
        if (!In_TradeCategoryflag || typeof In_TradeCategoryflag !== 'string') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_TradeCategoryflag'." });
        }
        if (!In_orgid || isNaN(Number(In_orgid))) {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_orgid'." });
        }
        if (!in_ipaddr || typeof in_ipaddr !== 'string') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'in_ipaddr'." });
        }
        if (!in_source || typeof in_source !== 'string') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'in_source'." });
        }

        // TradeCategoryId required for update
        if (Number(In_Mode) === 2 && (In_TradeCategoryid === undefined || isNaN(Number(In_TradeCategoryid)))) {
            return res.status(400).json({ success: false, message: "In update mode, 'In_TradeCategoryid' is required and must be a number." });
        }

        connection = await getConnection();

        // Prepare PL/SQL string (no binds for input)
        const plsql = `
            DECLARE
                Out_Errorcode NUMBER;
                Out_Errormsg VARCHAR2(500);
            BEGIN
                Aomk_TradeCategory_Ins(
                    In_Userid            => '${In_Userid}',
                    In_Mode              => ${In_Mode},
                    In_TradeCategoryid   => ${In_TradeCategoryid ? In_TradeCategoryid : 'NULL'},
                    In_TradeCategoryname => '${In_TradeCategoryname.replace(/'/g, "''")}',
                    In_TradeCategoryflag => '${In_TradeCategoryflag}',
                    In_orgid             => ${In_orgid},
                    in_ipaddr            => '${in_ipaddr}',
                    in_source            => '${in_source}',
                    Out_Errorcode        => Out_Errorcode,
                    Out_Errormsg         => Out_Errormsg
                );
                :out_errorcode := Out_Errorcode;
                :out_errormsg := Out_Errormsg;
            END;
        `;

        const result = await connection.execute(plsql, {
            out_errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
        });

        const outErrCode = result.outBinds.out_errorcode;
        const outErrorMessage = result.outBinds.out_errormsg;

        if (outErrCode === 9999) {
            return res.status(200).json({
                success: true,
                message: outErrorMessage,
                errorCode: outErrCode
            });
        } else {
            return res.status(400).json({
                success: false,
                message: outErrorMessage,
                errorCode: outErrCode
            });
        }

    } catch (error) {
        console.error('Error in Aomk_TradeCategory_Ins:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while processing trade category.',
            errorDetail: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("DB connection closed.");
            } catch (err) {
                console.error('Error closing DB connection:', err);
            }
        }
    }
};

module.exports = Aomk_TradeCategory_Ins;














// const oracledb = require("oracledb");
// const { getConnection } = require("../../../config/database");

// const Aomk_TradeCategory_Ins = async (req, res) => {
//     let connection;
//     try {
//         // Extract parameters from the request body, matching PL/SQL names
//         const {
//             In_Userid,
//             In_Mode,
//             In_TradeCategoryid,
//             In_TradeCategoryname,
//             In_TradeCategoryflag,
//             In_orgid,
//             in_ipaddr,
//             in_source
//         } = req.body;

//         // --- Node.js-side Validation (replicated from PL/SQL) ---
//         if (!In_Userid || In_Userid.trim() === '') {
//             return res.status(400).json({
//                 errorCode: -190,
//                 message: 'Parameter Userid Is Not Set'
//             });
//         }

//         if (!In_TradeCategoryname || In_TradeCategoryname.trim() === '') {
//             return res.status(400).json({
//                 errorCode: -191,
//                 message: 'Parameter Trade Category Name Is Not Set'
//             });
//         }

//         if (In_Mode === undefined || isNaN(In_Mode) || (In_Mode !== 1 && In_Mode !== 2)) {
//             return res.status(400).json({
//                 errorCode: -100, // Custom error code for invalid mode
//                 message: 'Parameter In_Mode (1 for Insert, 2 for Update) is required and must be a number (1 or 2).'
//             });
//         }

//         if (In_orgid === undefined || isNaN(In_orgid)) {
//             return res.status(400).json({
//                 errorCode: -101, // Custom error code for missing orgId
//                 message: 'Parameter In_orgid is required and must be a number.'
//             });
//         }

//         connection = await getConnection();

//         // Transaction management: oracledb's execute defaults to auto-commit=false for DML,
//         // so explicit commit is needed. Rollback will be handled in catch.

//         let v_TradeCategoryid = In_TradeCategoryid || null; // Will be generated for insert mode
//         let outErrorcode = 0;
//         let outErrormsg = '';

//         if (In_Mode === 1) { // --- Insert Mode ---
//             // Get nextval for TradeCategory ID
//             const seqResult = await connection.execute(
//                 `SELECT SQ_tradeCategory_ID.Nextval FROM Dual`,
//                 {},
//                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
//             );
//             v_TradeCategoryid = seqResult.rows[0].NEXTVAL;

//             // Check if Trade Category Name already exists (replicates PL/SQL's SELECT INTO ... EXCEPTION WHEN NO_DATA_FOUND)
//             const checkExistsSql = `
//                 SELECT num_tradecategory_id
//                 FROM aomk_tradecategory_mas
//                 WHERE UPPER(var_tradecategory_name) = UPPER(:In_TradeCategoryname)
//                   AND num_tradecategory_ulbid = :In_orgid
//             `;
//             const checkResult = await connection.execute(
//                 checkExistsSql,
//                 {
//                     In_TradeCategoryname: In_TradeCategoryname,
//                     In_orgid: In_orgid
//                 },
//                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
//             );

//             if (checkResult.rows.length > 0) { // If a row is found, it already exists
//                 outErrorcode = -192;
//                 outErrormsg = 'Trade Category Already Present';
//                 await connection.rollback(); // Rollback any sequence increments or prior DML
//                 return res.status(400).json({ errorCode: outErrorcode, message: outErrormsg });
//             }

//             // Insert into aomk_tradecategory_mas
//             const insertSql = `
//                 INSERT INTO aomk_tradecategory_mas(
//                     num_tradecategory_id, var_tradecategory_name, var_tradecategory_flag,
//                     dat_tradecategory_insdt, var_tradecategory_insby,
//                     dat_tradecategory_upddt, var_tradecategory_updby, num_tradecategory_ulbid
//                 ) VALUES (
//                     :V_TradeCategoryid, :In_TradeCategoryname, :In_TradeCategoryflag, SYSDATE, :In_Userid,
//                     NULL, NULL, :In_orgid
//                 )
//             `;
//             await connection.execute(insertSql, {
//                 V_TradeCategoryid: v_TradeCategoryid,
//                 In_TradeCategoryname: In_TradeCategoryname,
//                 In_TradeCategoryflag: In_TradeCategoryflag,
//                 In_Userid: In_Userid,
//                 In_orgid: In_orgid
//             });

//             // Log activity
//             await connection.execute(
//                 `BEGIN ADMINS.aoma_activity_log_ins(:orgid, :userid, 'Trade Category', 'INSERT', 'Trade Category Id:' || :tradeCategoryId, :ipaddr, :source); END;`,
//                 {
//                     orgid: In_orgid,
//                     userid: In_Userid,
//                     tradeCategoryId: v_TradeCategoryid,
//                     ipaddr: in_ipaddr || null, // Handle null/undefined
//                     source: in_source || null // Handle null/undefined
//                 }
//             );

//             outErrorcode = 9999;
//             outErrormsg = 'Trade Category Inserted Successfully!';

//         } else if (In_Mode === 2) { // --- Update Mode ---
//             if (In_TradeCategoryid === undefined || isNaN(In_TradeCategoryid)) {
//                 outErrorcode = -193;
//                 outErrormsg = 'Parameter Trade Categoryid Is Not Set';
//                 return res.status(400).json({ errorCode: outErrorcode, message: outErrormsg });
//             }
//             v_TradeCategoryid = In_TradeCategoryid; // Use provided ID for update

//             // Check if a DIFFERENT Trade Category with the new name already exists for this org
//             const checkExistsSql = `
//                 SELECT num_tradecategory_id
//                 FROM aomk_tradecategory_mas
//                 WHERE UPPER(var_tradecategory_name) = UPPER(:In_TradeCategoryname)
//                   AND num_tradecategory_ulbid = :In_orgid
//                   AND num_tradecategory_id != :In_TradeCategoryid_check
//             `;
//             const checkResult = await connection.execute(
//                 checkExistsSql,
//                 {
//                     In_TradeCategoryname: In_TradeCategoryname,
//                     In_orgid: In_orgid,
//                     In_TradeCategoryid_check: In_TradeCategoryid // Exclude the current ID from the check
//                 },
//                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
//             );

//             if (checkResult.rows.length > 0) {
//                 outErrorcode = -194;
//                 outErrormsg = 'Trade Category Already Present';
//                 await connection.rollback(); // Rollback any prior DML if needed
//                 return res.status(400).json({ errorCode: outErrorcode, message: outErrormsg });
//             }

//             // --- IMPORTANT: Replicate the LOG INSERT before UPDATE ---
//             const logInsertSql = `
//                 INSERT INTO aomk_tradecategory_mas_log (
//                     num_tradecategory_id, var_tradecategory_name, var_tradecategory_flag,
//                     dat_tradecategory_insdt, var_tradecategory_insby,
//                     dat_tradecategory_upddt, var_tradecategory_updby, num_tradecategory_ulbid
//                 )
//                 SELECT
//                     num_tradecategory_id, var_tradecategory_name, var_tradecategory_flag,
//                     dat_tradecategory_insdt, var_tradecategory_insby,
//                     dat_tradecategory_upddt, var_tradecategory_updby, num_tradecategory_ulbid
//                 FROM aomk_tradecategory_mas
//                 WHERE num_tradecategory_id = :In_TradeCategoryid_log
//                   AND num_tradecategory_ulbid = :In_orgid_log
//             `;
//             const logInsertResult = await connection.execute(logInsertSql, {
//                 In_TradeCategoryid_log: In_TradeCategoryid,
//                 In_orgid_log: In_orgid
//             });

//             if (logInsertResult.rowsAffected === 0) {
//                 // If the record to be logged wasn't found, it means the main record also doesn't exist for update
//                 outErrorcode = -195; // Custom: Trade Category not found for logging/update
//                 outErrormsg = 'Trade Category not found for update or criteria mismatch.';
//                 await connection.rollback();
//                 return res.status(404).json({ errorCode: outErrorcode, message: outErrormsg });
//             }


//             // Perform the update
//             const updateSql = `
//                 UPDATE aomk_tradecategory_mas SET
//                     var_tradecategory_name = :In_TradeCategoryname,
//                     var_tradecategory_flag = :In_TradeCategoryflag,
//                     dat_tradecategory_upddt = SYSDATE,
//                     var_tradecategory_updby = :In_Userid
//                 WHERE
//                     num_tradecategory_id = :In_TradeCategoryid
//                     AND num_tradecategory_ulbid = :In_orgid
//             `;
//             const updateResult = await connection.execute(updateSql, {
//                 In_TradeCategoryname: In_TradeCategoryname,
//                 In_TradeCategoryflag: In_TradeCategoryflag,
//                 In_Userid: In_Userid,
//                 In_TradeCategoryid: In_TradeCategoryid,
//                 In_orgid: In_orgid
//             });

//             if (updateResult.rowsAffected === 0) {
//                 // This case should ideally not happen if logInsertResult.rowsAffected was > 0,
//                 // but kept for robustness.
//                 outErrorcode = -196; // Custom: Update failed despite logging
//                 outErrormsg = 'Trade Category update failed.';
//                 await connection.rollback();
//                 return res.status(404).json({ errorCode: outErrorcode, message: outErrormsg });
//             }

//             // Log activity
//             await connection.execute(
//                 `BEGIN ADMINS.aoma_activity_log_ins(:orgid, :userid, 'Trade Category', 'Update', 'Trade Category Id:' || :tradeCategoryId, :ipaddr, :source); END;`,
//                 {
//                     orgid: In_orgid,
//                     userid: In_Userid,
//                     tradeCategoryId: In_TradeCategoryid,
//                     ipaddr: in_ipaddr || null,
//                     source: in_source || null
//                 }
//             );

//             outErrorcode = 9999;
//             outErrormsg = 'Trade Category Updated Successfully!';
//         }

//         await connection.commit(); // Commit the entire transaction
//         res.status(200).json({ errorCode: outErrorcode, message: outErrormsg });

//     } catch (err) {
//         // --- Handle any errors during the transaction ---
//         console.error('Error in Aomk_TradeCategory_Ins_Node procedure:', err);
//         let errorLineNo = '';
//         if (err.stack) {
//             const stackLines = err.stack.split('\n');
//             const errorLine = stackLines.find(line => line.includes('at Aomk_TradeCategory_Ins_Node'));
//             if (errorLine) {
//                 const match = errorLine.match(/:(\d+):\d+\)$/);
//                 if (match && match[1]) {
//                     errorLineNo = match[1];
//                 }
//             }
//         }
//         outErrorcode = -110; // General 'Unsuccess' code as per PL/SQL
//         outErrormsg = 'Unsuccess';

//         if (connection) {
//             try {
//                 await connection.rollback(); // Rollback transaction on error
//                 // Log error to Admins.Aoma_Error_Log_Ins (assuming it's a separate procedure/function)
//                 await connection.execute(
//                     `BEGIN Admins.Aoma_Error_Log_Ins(:orgid, :userid, 'Aomk_TradeCategory_Ins_Node', :errorcode, :sqlcode, :sqlerrm, :errordetails); END;`,
//                     {
//                         orgid: req.body.In_orgid || null, // Try to get from request body if available
//                         userid: req.body.In_Userid || null,
//                         errorcode: outErrorcode,
//                         sqlcode: err.errorNum || -1, // Oracle error number
//                         sqlerrm: (err.message || 'Unknown error').substring(0, 200), // Truncate to 200 chars
//                         errordetails: `Errorline No:${errorLineNo}` // Pass Node.js error line
//                     }
//                 );
//                 await connection.commit(); // Commit the error log entry (important, as this is a separate DML)
//             } catch (rollbackErr) {
//                 console.error('Error during rollback or error logging in Aomk_TradeCategory_Ins_Node:', rollbackErr);
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
//                 console.error('Error closing connection in Aomk_TradeCategory_Ins_Node finally block:', err);
//             }
//         }
//     }
// };

// module.exports = Aomk_TradeCategory_Ins