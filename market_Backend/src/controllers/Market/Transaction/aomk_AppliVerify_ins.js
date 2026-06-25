const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database"); // Adjust path if needed

const aomk_AppliVerify_ins = async (req, res) => {
    let connection;

    try {
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
            in_amount,
            In_OrgId,
            In_ArrAmount,
            in_ipaddr,
            In_siuser,
            in_PropNo,
            in_MarketPropNo
        } = req.body;

        // --- Minimal validation ---
        if (!In_UserId || !In_Appid || !In_AppliNo || !In_ShopName) {
            return res.status(400).json({
                success: false,
                message: "Missing mandatory parameters: In_UserId, In_Appid, In_AppliNo, In_ShopName"
            });
        }

        connection = await getConnection();

        const sql = `
            BEGIN
                aomk_AppliVerify_ins(
                    In_UserId             => :In_UserId,
                    In_Appid              => :In_Appid,
                    In_AppliNo            => :In_AppliNo,
                    In_OldLicencNo        => :In_OldLicencNo,
                    In_ShopName           => :In_ShopName,
                    In_PANNo              => :In_PANNo,
                    In_ContactNo          => :In_ContactNo,
                    In_Email              => :In_Email,
                    In_Address            => :In_Address,
                    In_ZoneId             => :In_ZoneId,
                    In_WardId             => :In_WardId,
                    In_IsProd             => :In_IsProd,
                    In_OwnSpace           => :In_OwnSpace,
                    In_Agrmentwith        => :In_Agrmentwith,
                    In_Area               => :In_Area,
                    In_IsCorpNOC          => :In_IsCorpNOC,
                    In_BusStartYr         => :In_BusStartYr,
                    In_ShopActNo          => :In_ShopActNo,
                    In_foodlicno          => :In_foodlicno,
                    In_LicDays            => :In_LicDays,
                    In_Applitrade_Str     => :In_Applitrade_Str,
                    In_Applitradetype_Str => :In_Applitradetype_Str,
                    In_Applidirector_Str  => :In_Applidirector_Str,
                    In_Source             => :In_Source,
                    In_ShopNameMar        => :In_ShopNameMar,
                    In_PlaceOwnerName     => :In_PlaceOwnerName,
                    In_PlaceOwnerAddress  => :In_PlaceOwnerAddress,
                    In_FromDate           => TO_DATE(:In_FromDate,'DD-MM-YYYY'),
                    In_ToDate             => TO_DATE(:In_ToDate,'DD-MM-YYYY'),
                    in_amount             => :in_amount,
                    In_OrgId              => :In_OrgId,
                    In_ArrAmount          => :In_ArrAmount,
                    in_ipaddr             => :in_ipaddr,
                    In_siuser             => :In_siuser,
                    in_PropNo             => :in_PropNo,
                    in_MarketPropNo       => :in_MarketPropNo,
                    Out_Errorcode         => :Out_Errorcode,
                    Out_Errormsg          => :Out_Errormsg,
                    Out_Appid             => :Out_Appid,
                    Out_AppliNo           => :Out_AppliNo
                );
            END;
        `;

        const binds = {
            In_UserId,
            In_Appid,
            In_AppliNo,
            In_OldLicencNo: In_OldLicencNo || null,
            In_ShopName,
            In_PANNo: In_PANNo || null,
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
            In_LicDays: In_LicDays || null,
            In_Applitrade_Str,
            In_Applitradetype_Str,
            In_Applidirector_Str,
            In_Source,
            In_ShopNameMar,
            In_PlaceOwnerName,
            In_PlaceOwnerAddress,
            In_FromDate,
            In_ToDate,
            in_amount,
            In_OrgId,
            In_ArrAmount,
            in_ipaddr,
            In_siuser,
            in_PropNo: in_PropNo || null,
            in_MarketPropNo: in_MarketPropNo || null,
            Out_Errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            Out_Errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 4000 },
            Out_Appid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            Out_AppliNo: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 }
        };

        const options = { autoCommit: true };

        const result = await connection.execute(sql, binds, options);

        const { Out_Errorcode, Out_Errormsg, Out_Appid, Out_AppliNo } = result.outBinds;

        if (Out_Errorcode === 9999) {
            return res.json({
                success: true,
                message: Out_Errormsg,
                data: { applicationId: Out_Appid, applicationNo: Out_AppliNo },
                errorCode: Out_Errorcode
            });
        } else {
            return res.status(400).json({
                success: false,
                message: Out_Errormsg,
                errorCode: Out_Errorcode
            });
        }

    } catch (error) {
        console.error("Error in aomk_AppliVerify_ins:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errorDetail: error.message
        });
    } finally {
        if (connection) {
            try { await connection.close(); } catch (err) { console.error(err); }
        }
    }
};

module.exports = aomk_AppliVerify_ins;
