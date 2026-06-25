const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const aomk_appli_auth_ins = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const {
      In_UserId,
      In_Appid,
      In_AppliNo,
      In_OldLicencNo,
      In_ShopName,
      In_PANNo,
      In_ContactNo,
      In_Email,
      In_Address,
      In_ZoneId,
      In_WardId,
      In_IsProd,
      In_OwnSpace,
      In_Agrmentwith,
      In_Area,
      In_IsCorpNOC,
      In_BusStartYr,
      In_ShopActNo,
      In_foodlicno,
      In_LicDays,
      In_Applitrade_Str,
      In_Applitradetype_Str,
      In_Applidirector_Str,
      In_Source,
      In_ShopNameMar,
      In_PlaceOwnerName,
      In_PlaceOwnerAddress,
      In_FromDate,
      In_ToDate,
      In_Appstatus,
      In_Appstatusremark,
      in_amount,
      In_OrgId,
      in_arramount,
      in_ipaddr,
      in_PropNo,
      in_MarketPropNo
    } = req.body;

    console.log(req.body);

    const result = await connection.execute(
      `
      BEGIN
        aomk_appli_auth_ins(
          :In_UserId,
          :In_Appid,
          :In_AppliNo,
          :In_OldLicencNo,
          :In_ShopName,
          :In_PANNo,
          :In_ContactNo,
          :In_Email,
          :In_Address,
          :In_ZoneId,
          :In_WardId,
          :In_IsProd,
          :In_OwnSpace,
          :In_Agrmentwith,
          :In_Area,
          :In_IsCorpNOC,
          :In_BusStartYr,
          :In_ShopActNo,
          :In_foodlicno,
          :In_LicDays,
          :In_Applitrade_Str,
          :In_Applitradetype_Str,
          :In_Applidirector_Str,
          :In_Source,
          :In_ShopNameMar,
          :In_PlaceOwnerName,
          :In_PlaceOwnerAddress,
          TO_DATE(:In_FromDate, 'YYYY-MM-DD'),
          TO_DATE(:In_ToDate, 'YYYY-MM-DD'),
          :In_Appstatus,
          :In_Appstatusremark,
          :in_amount,
          :In_OrgId,
          :in_arramount,
          :in_ipaddr,
          :in_PropNo,
          :in_MarketPropNo,
          :Out_Errorcode,
          :Out_Errormsg
        );
      END;
      `,
      {
        In_UserId,
        In_Appid,
        In_AppliNo,
        In_OldLicencNo,
        In_ShopName,
        In_PANNo,
        In_ContactNo,
        In_Email,
        In_Address,
        In_ZoneId,
        In_WardId,
        In_IsProd,
        In_OwnSpace,
        In_Agrmentwith,
        In_Area,
        In_IsCorpNOC,
        In_BusStartYr,
        In_ShopActNo,
        In_foodlicno,
        In_LicDays,
        In_Applitrade_Str,
        In_Applitradetype_Str,
        In_Applidirector_Str,
        In_Source,
        In_ShopNameMar,
        In_PlaceOwnerName,
        In_PlaceOwnerAddress,
        In_FromDate,
        In_ToDate,
        In_Appstatus,
        In_Appstatusremark,
        in_amount,
        In_OrgId,
        in_arramount,
        in_ipaddr,
        in_PropNo,
        in_MarketPropNo,
        Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_Errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING }
      },
      { autoCommit: true }
    );

    console.log("result", result);

    res.json({
      status: "success",
      Out_Errorcode: result.outBinds.Out_Errorcode,
      Out_Errormsg: result.outBinds.Out_Errormsg
    });
  } catch (err) {
    console.error("Error in aomk_appli_auth_ins:", err);
    res.status(500).json({ error: err.message });
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

const aomk_bill_ins = async (req, res) => {
    let connection;

    try {
        connection = await getConnection();

        const {
            In_UserId,
            In_BillNo,
            In_BillDate,
            In_DueDate,
            In_licenceNo,
            In_FromDate,
            In_ToDate,
            In_WardID,
            In_TYPE,
            In_ULBID,
            In_RECEIPTNO,
            In_ARREARS,
            In_CURRENT,
            In_EntryType
        } = req.body;

        // Convert date strings to proper JS Date objects if provided
        const billDate = In_BillDate ? new Date(In_BillDate) : null;
        const dueDate = In_DueDate ? new Date(In_DueDate) : null;
        const fromDate = In_FromDate ? new Date(In_FromDate) : null;
        const toDate = In_ToDate ? new Date(In_ToDate) : null;

        const result = await connection.execute(
            `BEGIN aomk_bill_ins(
                :In_UserId,
                :In_BillNo,
                :In_BillDate,
                :In_DueDate,
                :In_licenceNo,
                :In_FromDate,
                :In_ToDate,
                :In_WardID,
                :In_TYPE,
                :In_ULBID,
                :In_RECEIPTNO,
                :In_ARREARS,
                :In_CURRENT,
                :In_EntryType,
                :Out_Errorcode,
                :Out_Errormsg,
                :Out_Billid,
                :Out_BillNo
            ); END;`,
            {
                In_UserId: In_UserId,
                In_BillNo: In_BillNo,
                In_BillDate: billDate,
                In_DueDate: dueDate,
                In_licenceNo: In_licenceNo,
                In_FromDate: fromDate,
                In_ToDate: toDate,
                In_WardID: In_WardID,
                In_TYPE: In_TYPE,
                In_ULBID: In_ULBID,
                In_RECEIPTNO: In_RECEIPTNO,
                In_ARREARS: In_ARREARS,
                In_CURRENT: In_CURRENT,
                In_EntryType: In_EntryType,

                // Output parameters
                Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                Out_Errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 },
                Out_Billid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                Out_BillNo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 }
            },
            { autoCommit: true }
        );

        const { Out_Errorcode, Out_Errormsg, Out_Billid, Out_BillNo } = result.outBinds;

        if (Out_Errorcode === 9999) {
            res.status(200).json({
                success: true,
                message: Out_Errormsg,
                BillId: Out_Billid,
                BillNo: Out_BillNo,
                errorCode: Out_Errorcode
            });
        } else {
            res.status(400).json({
                success: false,
                message: Out_Errormsg,
                BillId: Out_Billid,
                BillNo: Out_BillNo,
                errorCode: Out_Errorcode
            });
        }

    } catch (err) {
        console.error("Error executing stored procedure aomk_bill_ins:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing database connection:", err);
            }
        }
    }
};

module.exports = {aomk_appli_auth_ins,aomk_bill_ins};