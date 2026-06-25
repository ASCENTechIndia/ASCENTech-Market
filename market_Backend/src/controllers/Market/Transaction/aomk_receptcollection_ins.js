const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

function formatDateToDDMMYYYY(dateInput) {
  if (!dateInput) {
    return null;
  }

  let date;
  if (typeof dateInput === "string") {
    // Matches DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY
    const parts = dateInput.match(/^(\d{2})[-./](\d{2})[-./](\d{4})$/);
    if (parts) {
      // Month is 0-indexed in Date constructor, so parts[2] - 1
      date = new Date(parts[3], parts[2] - 1, parts[1]);
    } else {
      // Attempt to parse other standard date strings
      date = new Date(dateInput);
    }
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) {
    return null;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

const aomk_receptcollection_ins = async (req, res) => {
  let connection;
  try {
    const {
      in_userid,
      in_LICID,
      in_LICno,
      in_amount,
      in_receiptDt,
      in_payMode,
      in_BankId,
      In_BranchName, // Ensure consistent capitalization
      in_instrumentNo,
      in_instrudate,
      in_remark,
      in_orgId,
      in_COLLCENTERID,
      in_mode,
      in_str,
      in_payflag,
      in_service,
      in_appliid,
      in_gst,
      in_totamt,
    } = req.body;

    connection = await getConnection();

    // Log the input parameters to double-check their values and types before execution
    console.log("Input Parameters:", {
      in_userid,
      in_LICID,
      in_LICno,
      in_amount,
      in_receiptDt: formatDateToDDMMYYYY(in_receiptDt), // Formatted for logging
      in_payMode,
      in_BankId,
      In_BranchName,
      in_instrumentNo,
      in_instrudate: formatDateToDDMMYYYY(in_instrudate), // Formatted for logging
      in_remark,
      in_orgId,
      in_COLLCENTERID,
      in_mode,
      in_str,
      in_payflag,
      in_service,
      in_appliid,
      in_gst,
      in_totamt,
    });

    const result = await connection.execute(
      `BEGIN
         aomk_receptcollection_ins(
           in_userid => :in_userid,
           in_LICID => :in_LICID,
           in_LICno => :in_LICno,
           in_amount => :in_amount,
           in_receiptDt => TO_DATE(:in_receiptDt, 'DD-MM-YYYY'),
           in_payMode => :in_payMode,
           in_BankId => :in_BankId,
           In_BranchName => :In_BranchName,
           in_instrumentNo => :in_instrumentNo,
           in_instrudate => TO_DATE(:in_instrudate, 'DD-MM-YYYY'),
           in_remark => :in_remark,
           in_orgId => :in_orgId,
           in_COLLCENTERID => :in_COLLCENTERID,
           in_mode => :in_mode,
           in_str => :in_str,
           in_payflag => :in_payflag,
           in_service => :in_service,
           in_appliid => :in_appliid,
           in_gst => :in_gst,
           in_totamt => :in_totamt,
           out_errcode => :out_errcode,
           out_ErrMsg => :out_ErrMsg,
           out_Recno => :out_Recno
         );
       END;`,
      {
        // Bind variables: explicitly define types for numbers and dates for robustness
        in_userid: { val: in_userid, type: oracledb.VARCHAR2 },
        in_LICID: { val: in_LICID, type: oracledb.NUMBER },
        in_LICno: { val: in_LICno, type: oracledb.VARCHAR2 },
        in_amount: { val: in_amount, type: oracledb.NUMBER },
        in_receiptDt: {
          val: formatDateToDDMMYYYY(in_receiptDt),
          type: oracledb.VARCHAR2,
        }, // Sending as string for TO_DATE
        in_payMode: { val: in_payMode, type: oracledb.NUMBER },
        in_BankId: { val: in_BankId, type: oracledb.NUMBER },
        In_BranchName: { val: In_BranchName, type: oracledb.VARCHAR2 },
        in_instrumentNo: { val: in_instrumentNo, type: oracledb.VARCHAR2 },
        in_instrudate: {
          val: formatDateToDDMMYYYY(in_instrudate),
          type: oracledb.VARCHAR2,
        }, // Sending as string for TO_DATE
        in_remark: { val: in_remark, type: oracledb.VARCHAR2 },
        in_orgId: { val: in_orgId, type: oracledb.NUMBER },
        in_COLLCENTERID: { val: in_COLLCENTERID, type: oracledb.NUMBER },
        in_mode: { val: in_mode, type: oracledb.NUMBER },
        in_str: { val: in_str, type: oracledb.VARCHAR2 },
        in_payflag: { val: in_payflag, type: oracledb.VARCHAR2 },
        in_service: { val: in_service, type: oracledb.VARCHAR2 },
        in_appliid: { val: in_appliid, type: oracledb.NUMBER },
        in_gst: { val: in_gst, type: oracledb.NUMBER }, // Treat decimal as NUMBER
        in_totamt: { val: in_totamt, type: oracledb.NUMBER }, // Treat decimal as NUMBER
        out_errcode: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        out_ErrMsg: { type: oracledb.VARCHAR2, dir: oracledb.BIND_OUT },
        out_Recno: { type: oracledb.VARCHAR2, dir: oracledb.BIND_OUT },
      },
      { autoCommit: false }
    );

    const { out_errcode, out_ErrMsg, out_Recno } = result.outBinds;

    if (out_errcode === 9999) {
      await connection.commit();
      res.status(200).json({
        success: true,
        errCode: out_errcode,
        message: out_ErrMsg,
        receiptNo: out_Recno,
      });
    } else {
      await connection.rollback();
      res.status(400).json({
        success: false,
        errCode: out_errcode,
        message: out_ErrMsg,
      });
    }
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Error during rollback:", rollbackError);
      }
    }
    console.error("Error executing aomk_receptcollection_ins:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error during receipt collection.",
      error: {
        message: error.message,
        code: error.code || "UNKNOWN",
        oracleErrorNum: error.errorNum || null,
      },
    });
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

module.exports = {
  aomk_receptcollection_ins,
};
