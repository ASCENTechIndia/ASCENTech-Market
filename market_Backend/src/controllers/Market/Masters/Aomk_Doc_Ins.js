const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const  Aomk_Doc_Ins = async (req, res) => {
  let connection;

  try {
    const {
      In_Userid,
      In_Mode,
      In_DocId,
      In_Docname,
      In_Docflag,
      In_orgid,
      in_ipaddr,
      in_source
    } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        Aomk_Doc_Ins(
          :In_Userid,
          :In_Mode,
          :In_DocId,
          :In_Docname,
          :In_Docflag,
          :In_orgid,
          :in_ipaddr,
          :in_source,
          :Out_Errorcode,
          :Out_Errormsg
        );
      END;
      `,
      {
        In_Userid: { val: In_Userid, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_Mode: { val: In_Mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_DocId: { val: In_DocId, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_Docname: { val: In_Docname, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_Docflag: { val: In_Docflag, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_orgid: { val: In_orgid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_ipaddr: { val: in_ipaddr, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_source: { val: in_source, dir: oracledb.BIND_IN, type: oracledb.STRING },
        Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_Errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      }
    );

    res.json({
      success: true,
      errorcode: result.outBinds.Out_Errorcode,
      errormsg: result.outBinds.Out_Errormsg
    });

  } catch (err) {
    console.error("Error in aomkDocIns:", err);
    res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }
};

module.exports =  Aomk_Doc_Ins











// const oracledb = require("oracledb");
// const { getConnection } = require("../../../config/database"); 

// const Aomk_Doc_Ins = async (req, res) => {
//     let connection;
//     try {
//         const {
//             In_Userid,
//             In_Mode,
//             In_DocId,
//             In_Docname,
//             In_Docflag,
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

//         if (!In_Docname || In_Docname.trim() === '') {
//             return res.status(400).json({
//                 errorCode: -110,
//                 message: 'Parameter Document Name Is Not Set'
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

//         // Transaction management: oracledb's execute defaults to auto-commit=false for DML.
//         // Explicit commit is needed. Rollback will be handled in catch block.

//         let v_Docid = In_DocId || null; // Will be generated for insert mode if not provided
//         let outErrorcode = 0;
//         let outErrormsg = '';

//         if (In_Mode === 1) { // --- Insert Mode ---
//             // Get nextval for Document ID
//             const seqResult = await connection.execute(
//                 `SELECT Sq_Doc_Id.Nextval FROM Dual`,
//                 {},
//                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
//             );
//             v_Docid = seqResult.rows[0].NEXTVAL;

//             // Check if Document Name already exists for this organization
//             const checkExistsSql = `
//                 SELECT Num_Doc_Id
//                 FROM Aomk_Doc_Mas
//                 WHERE UPPER(Var_Doc_Name) = UPPER(:In_Docname)
//                   AND num_doc_ulbid = :In_orgid
//             `;
//             const checkResult = await connection.execute(
//                 checkExistsSql,
//                 {
//                     In_Docname: In_Docname,
//                     In_orgid: In_orgid
//                 },
//                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
//             );

//             if (checkResult.rows.length > 0) { // If a row is found, it already exists
//                 outErrorcode = -120;
//                 outErrormsg = 'Document Name Already Present';
//                 await connection.rollback(); // Rollback any sequence increments
//                 return res.status(400).json({ errorCode: outErrorcode, message: outErrormsg });
//             }

//             // Insert into Aomk_Doc_Mas
//             const insertSql = `
//                 INSERT INTO Aomk_Doc_Mas (
//                     Num_Doc_Id, Var_Doc_Name, Var_Doc_Flag,
//                     Dat_Doc_Insdt, Var_Doc_Insby,
//                     Dat_Doc_Upddt, Var_Doc_Updby, num_doc_ulbid
//                 ) VALUES (
//                     :V_Docid, :In_Docname, :In_Docflag, SYSDATE, :In_Userid,
//                     NULL, NULL, :In_orgid
//                 )
//             `;
//             await connection.execute(insertSql, {
//                 V_Docid: v_Docid,
//                 In_Docname: In_Docname,
//                 In_Docflag: In_Docflag,
//                 In_Userid: In_Userid,
//                 In_orgid: In_orgid
//             });

//             // Log activity
//             await connection.execute(
//                 `BEGIN ADMINS.aoma_activity_log_ins(:orgid, :userid, 'Doc Type', 'INSERT', 'Doc Id:' || :docid, :ipaddr, :source); END;`,
//                 {
//                     orgid: In_orgid,
//                     userid: In_Userid,
//                     docid: v_Docid,
//                     ipaddr: in_ipaddr || null, // Handle null/undefined
//                     source: in_source || null // Handle null/undefined
//                 }
//             );

//             outErrorcode = 9999;
//             outErrormsg = 'Document Name Inserted Successfully!';

//         } else if (In_Mode === 2) { // --- Update Mode ---
//             if (In_DocId === undefined || isNaN(In_DocId)) {
//                 outErrorcode = -150;
//                 outErrormsg = 'Parameter Document id Is Not Set';
//                 return res.status(400).json({ errorCode: outErrorcode, message: outErrormsg });
//             }
//             v_Docid = In_DocId; // Use provided ID for update

//             // Check if a DIFFERENT Document with the new name already exists for this org
//             const checkExistsSql = `
//                 SELECT Num_Doc_Id
//                 FROM Aomk_Doc_Mas
//                 WHERE UPPER(Var_Doc_Name) = UPPER(:In_Docname)
//                   AND num_doc_ulbid = :In_orgid
//                   AND Num_Doc_Id != :In_DocId_check
//             `;
//             const checkResult = await connection.execute(
//                 checkExistsSql,
//                 {
//                     In_Docname: In_Docname,
//                     In_orgid: In_orgid,
//                     In_DocId_check: In_DocId // Exclude the current ID from the check
//                 },
//                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
//             );

//             if (checkResult.rows.length > 0) {
//                 outErrorcode = -120;
//                 outErrormsg = 'Document Name Already Present';
//                 await connection.rollback();
//                 return res.status(400).json({ errorCode: outErrorcode, message: outErrormsg });
//             }

//             // Perform the update
//             const updateSql = `
//                 UPDATE Aomk_Doc_Mas SET
//                     Var_Doc_Name = :In_Docname,
//                     Var_Doc_Flag = :In_Docflag,
//                     Dat_Doc_Upddt = SYSDATE,
//                     Var_Doc_Updby = :In_Userid
//                 WHERE
//                     Num_Doc_Id = :In_DocId
//                     AND num_doc_ulbid = :In_orgid
//             `;
//             const updateResult = await connection.execute(updateSql, {
//                 In_Docname: In_Docname,
//                 In_Docflag: In_Docflag,
//                 In_Userid: In_Userid,
//                 In_DocId: In_DocId,
//                 In_orgid: In_orgid
//             });

//             if (updateResult.rowsAffected === 0) {
//                 // If nothing was updated, it means the record didn't exist or conditions didn't match.
//                 outErrorcode = -160; // Custom: Document not found for update
//                 outErrormsg = 'Document not found for update or criteria mismatch.';
//                 await connection.rollback();
//                 return res.status(404).json({ errorCode: outErrorcode, message: outErrormsg });
//             }

//             // Log activity
//             await connection.execute(
//                 `BEGIN ADMINS.aoma_activity_log_ins(:orgid, :userid, 'Doc Type', 'Update', 'Doc Id:' || :docid, :ipaddr, :source); END;`,
//                 {
//                     orgid: In_orgid,
//                     userid: In_Userid,
//                     docid: In_DocId,
//                     ipaddr: in_ipaddr || null,
//                     source: in_source || null
//                 }
//             );

//             outErrorcode = 9999;
//             outErrormsg = 'Document Name Updated Successfully!';
//         }

//         await connection.commit(); // Commit the transaction
//         res.status(200).json({ errorCode: outErrorcode, message: outErrormsg });

//     } catch (err) {
//         // --- Handle any errors during the transaction ---
//         console.error('Error in Aomk_Doc_Ins_Node procedure:', err);
//         let errorLineNo = '';
//         if (err.stack) {
//             const stackLines = err.stack.split('\n');
//             // Find the line number related to the error within this function
//             const errorLine = stackLines.find(line => line.includes('at Aomk_Doc_Ins_Node'));
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
//                     `BEGIN Admins.Aoma_Error_Log_Ins(:orgid, :userid, 'Aomk_Doc_Ins_Node', :errorcode, :sqlcode, :sqlerrm, :errordetails); END;`,
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
//                 console.error('Error during rollback or error logging:', rollbackErr);
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
//                 console.error('Error closing connection in Aomk_Doc_Ins_Node:', err);
//             }
//         }
//     }
// };

// module.exports = Aomk_Doc_Ins