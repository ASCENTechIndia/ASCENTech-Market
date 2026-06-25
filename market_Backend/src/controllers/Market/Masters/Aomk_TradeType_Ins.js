const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const Aomk_TradeType_Ins = async (req, res) => {
  let connection;

  try {
    const {
      In_Userid,
      In_Mode,
      In_Tradetypeid,
      In_Tradetypename,
      In_Tradetypeflag,
      In_TradeRateStr,
      In_orgid,
      In_TradetypeCategoryid,
      in_ipaddr,
      in_source,
      in_code // ✅ Add this
    } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        Aomk_TradeType_Ins(
          :In_Userid,
          :In_Mode,
          :In_Tradetypeid,
          :In_Tradetypename,
          :In_Tradetypeflag,
          :In_TradeRateStr,
          :In_orgid,
          :In_TradetypeCategoryid,
          :in_ipaddr,
          :in_source,
          :in_code,           -- ✅ Add this line
          :Out_Errorcode,
          :Out_Errormsg
        );
      END;
      `,
      {
        In_Userid: { val: In_Userid, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_Mode: { val: In_Mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_Tradetypeid: { val: In_Tradetypeid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_Tradetypename: { val: In_Tradetypename, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_Tradetypeflag: { val: In_Tradetypeflag, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_TradeRateStr: { val: In_TradeRateStr, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_orgid: { val: In_orgid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_TradetypeCategoryid: { val: In_TradetypeCategoryid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_ipaddr: { val: in_ipaddr, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_source: { val: in_source, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_code: { val: in_code, dir: oracledb.BIND_IN, type: oracledb.STRING }, // ✅ added
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
    console.error("Error in Aomk_TradeType_Ins:", err);
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


module.exports = Aomk_TradeType_Ins
