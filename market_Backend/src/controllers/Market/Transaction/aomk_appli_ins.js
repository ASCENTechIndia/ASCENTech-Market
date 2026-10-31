// const oracledb = require('oracledb');
// const { getConnection } = require("../../../config/database");

// const aomk_appli_ins = async (req, res, next) => {
//   let connection;
//   try {

//     // --- Input Validation (Expanded and improved) ---
//     // Moved validation to the top for early exit on invalid input
//     if (!req.body.In_ShopName || typeof req.body.In_ShopName !== 'string') {
//       console.error('Validation Error: In_ShopName is missing or not a string.');
//       return res.status(400).json({
//         Out_Errorcode: -120,
//         Out_Errormsg: 'Parameter Shop Name Is Not Set or Invalid Type.'
//       });
//     }

//     if (req.body.In_Mode === undefined || (req.body.In_Mode !== 1 && req.body.In_Mode !== 2)) {
//       console.error('Validation Error: In_Mode is missing or invalid. Must be 1 (Insert) or 2 (Update).');
//       return res.status(400).json({
//         Out_Errorcode: -121, // Custom error code for mode validation
//         Out_Errormsg: 'Parameter Mode (In_Mode) must be 1 for Insert or 2 for Update.'
//       });
//     }

//     if (req.body.In_Mode === 2 && (req.body.In_Appid === undefined || req.body.In_Appid === null)) {
//       console.error('Validation Error: In_Appid is missing for Update mode.');
//       return res.status(400).json({
//         Out_Errorcode: -150,
//         Out_Errormsg: 'Parameter Application ID (In_Appid) is Not Set for Update Mode.'
//       });
//     }
//     // Add more validation for other critical fields as needed

//     connection = await getConnection();

//     const sql = `
//       BEGIN
//         aomk_appli_ins(
//           In_UserId             => :inUserId,
//           In_Appid              => :inAppid,
//           In_AppliNo            => :inAppliNo,
//           In_Mode               => :inMode,
//           In_OldLicencNo        => :inOldLicencNo,
//           In_ShopName           => :inShopName,
//           In_PANNo              => :inPANNo,
//           In_ContactNo          => :inContactNo,
//           In_Email              => :inEmail,
//           In_Address            => :inAddress,
//           In_ZoneId             => :inZoneId,
//           In_WardId             => :inWardId,
//           In_IsProd             => :inIsProd,
//           In_OwnSpace           => :inOwnSpace,
//           In_Agrmentwith        => :inAgrmentwith,
//           In_Area               => :inArea,
//           In_IsCorpNOC          => :inIsCorpNOC,
//           In_BusStartYr         => :inBusStartYr,
//           In_ShopActNo          => :inShopActNo,
//           In_foodlicno          => :infoodlicno,
//           In_LicDays            => :inLicDays,
//           In_Applitrade_Str     => :inApplitradeStr,
//           In_Applitradetype_Str => :inApplitradetypeStr,
//           In_Applidirector_Str  => :inApplidirectorStr,
//           In_Source             => :inSource,
//           In_ShopNameMar        => :inShopNameMar,
//           In_PlaceOwnerName     => :inPlaceOwnerName,
//           In_PlaceOwnerAddress  => :inPlaceOwnerAddress,
//           In_FromDate           => :inFromDate,
//           In_ToDate             => :inToDate,
//           in_amount             => :inAmount,
//           in_lictype            => :inLictype,
//           In_OrgId              => :inOrgId,
//           in_ipaddr             => :inIpaddr,
//           in_licensetypeid      => :inLicensetypeid,
//           in_arreasamt          => :inArreasamt,
//           in_Servid             => :inServid,
//           in_CFCRecno           => :inCFCRecno,
//           in_PropNo             => :in_PropNo,
//           in_MarketPropNo       => :in_MarketPropNo,
//           Out_Errorcode         => :outErrorcode,
//           Out_Errormsg          => :outErrormsg,
//           Out_Appid             => :outAppid,
//           Out_AppliNo           => :outAppliNo
//         );
//       END;
//     `;

//     // Modified parseDate function to handle DD-MM-YYYY
//     const parseDate = (dateString) => {
//       if (!dateString) {
//         return null; // Return null if the string is empty or null
//       }

//       const parts = dateString.split('-');
//       if (parts.length !== 3) {
//         console.warn(`Date string "${dateString}" does not match DD-MM-YYYY format.`);
//         return null; // Invalid format
//       }

//       const day = parseInt(parts[0], 10);
//       const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed in JavaScript Date
//       const year = parseInt(parts[2], 10);

//       const date = new Date(year, month, day);

//       // Validate the parsed date to ensure it's a real date and matches the input parts
//       // This checks for cases like "31-02-2024" which would become March 2nd
//       if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
//         console.warn(`Parsed date "${date}" from "${dateString}" is not valid or out of range.`);
//         return null;
//       }

//       return date; // Return a valid JavaScript Date object
//     };


//     const binds = {
//       inUserId:             req.body.In_UserId,
//       inAppid:              req.body.In_Appid || null,
//       inAppliNo:            req.body.In_AppliNo || null,
//       inMode:               req.body.In_Mode,
//       inOldLicencNo:        req.body.In_OldLicencNo || null,
//       inShopName:           req.body.In_ShopName,
//       inPANNo:              req.body.In_PANNo || null,
//       inContactNo:          req.body.In_ContactNo || null,
//       inEmail:              req.body.In_Email || null,
//       inAddress:            req.body.In_Address || null,
//       inZoneId:             req.body.In_ZoneId || null,
//       inWardId:             req.body.In_WardId || null,
//       inIsProd:             req.body.In_IsProd || null,
//       inOwnSpace:           req.body.In_OwnSpace || null,
//       inAgrmentwith:        req.body.In_Agrmentwith || null,
//       inArea:               req.body.In_Area || null,
//       inIsCorpNOC:          req.body.In_IsCorpNOC || null,
//       inBusStartYr:         req.body.In_BusStartYr || null,
//       inShopActNo:          req.body.In_ShopActNo || null,
//       infoodlicno:          req.body.In_foodlicno || null,
//       inLicDays:            req.body.In_LicDays || null,
//       inApplitradeStr:      req.body.In_Applitrade_Str || null,
//       inApplitradetypeStr:  req.body.In_Applitradetype_Str || null,
//       inApplidirectorStr:   req.body.In_Applidirector_Str || null,
//       inSource:             req.body.In_Source || 'ONLINE',
//       inShopNameMar:        req.body.In_ShopNameMar || null,
//       inPlaceOwnerName:     req.body.In_PlaceOwnerName || null,
//       inPlaceOwnerAddress:  req.body.In_PlaceOwnerAddress || null,
//       inFromDate:           parseDate(req.body.In_FromDate), // Use the modified helper for parsing
//       inToDate:             parseDate(req.body.In_ToDate),     // Use the modified helper for parsing
//       inAmount:             req.body.in_amount || null,
//       inLictype:            req.body.in_lictype || null,
//       inOrgId:              req.body.In_OrgId || null,
//       inIpaddr:             req.ip || '127.0.0.1',
//       inLicensetypeid:      req.body.in_licensetypeid || null,
//       inArreasamt:          req.body.in_arreasamt || null,
//       inServid:             req.body.in_Servid || null,
//       inCFCRecno:           req.body.in_CFCRecno || null,
//       in_PropNo:            req.body.in_PropNo,
//       in_MarketPropNo:      req.body.in_MarketPropNo,     
//       outErrorcode:         { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
//       outErrormsg:          { dir: oracledb.BIND_OUT, type: oracledb.VARCHAR2, maxSize: 500 },
//       outAppid:             { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
//       outAppliNo:           { dir: oracledb.BIND_OUT, type: oracledb.VARCHAR2, maxSize: 50 }
//     };


//     const options = {
//       autoCommit: false
//     };

//     const result = await connection.execute(sql, binds, options);

//     if (result.outBinds.outErrorcode === 9999) {
//       await connection.commit();
//       res.status(200).json({
//         Out_Errorcode: result.outBinds.outErrorcode,
//         Out_Errormsg: result.outBinds.outErrormsg,
//         Out_Appid: result.outBinds.outAppid,
//         Out_AppliNo: result.outBinds.outAppliNo
//       });
//     } else {
//       await connection.rollback();
//       console.error(`Procedure Error: Code ${result.outBinds.outErrorcode}, Message: ${result.outBinds.outErrormsg}`);
//       res.status(400).json({
//         Out_Errorcode: result.outBinds.outErrorcode,
//         Out_Errormsg: result.outBinds.outErrormsg
//       });
//     }

//   } catch (err) {
//     console.error('Error in aomk_appli_ins (acting as route handler):', err);
//     if (connection) {
//       try {
//         await connection.rollback();
//         console.log('Transaction rolled back due to error.');
//       } catch (rollbackErr) {
//         console.error('Error during rollback:', rollbackErr);
//       }
//     }
//     res.status(500).json({
//       Out_Errorcode: -999,
//       Out_Errormsg: `Server Error: ${err.message}`
//     });
//   } finally {
//     // if (connection) {
//     //   try {
//     //     await connection.close();
//     //     console.log('Database connection closed.');
//     //   } catch (err) {
//     //     console.error('Error closing connection:', err);
//     //   }
//     // }
//   }
// };

// module.exports = aomk_appli_ins;




const oracledb = require("oracledb");
const { getConnection } = require('../../../../src/config/database');

const aomk_appli_ins = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    const {
    In_UserId,             
    In_Appid,               
    In_AppliNo,             
    In_Mode,                 
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
    in_lictype,
    In_OrgId,
    in_ipaddr,
    
    in_licensetypeid,
    in_arreasamt,
    in_Servid,
    in_CFCRecno,
    in_PropNo,
    in_MarketPropNo        
    } = req.body;

  
    const bindVars = {
    In_UserId,             
    In_Appid,               
    In_AppliNo,             
    In_Mode,                 
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
    in_lictype,
    In_OrgId,
    in_ipaddr,
    
    in_licensetypeid,
    in_arreasamt,
    in_Servid,
    in_CFCRecno,
    in_PropNo,
    in_MarketPropNo,        
        Out_Errorcode: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        Out_Errormsg: { type: oracledb.STRING, dir: oracledb.BIND_OUT, maxSize: 200 },
        Out_Appid: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        Out_AppliNo: { type: oracledb.STRING, dir: oracledb.BIND_OUT }
        
    };

    const result = await connection.execute(
      `BEGIN 
         market.aomk_appli_ins(
    :In_UserId,             
    :In_Appid,               
    :In_AppliNo,             
    :In_Mode,                 
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

    
    :In_FromDate,
    :In_ToDate,
    :in_amount,
    :in_lictype,
    :In_OrgId,
    :in_ipaddr,
    
    :in_licensetypeid,
    :in_arreasamt,
    :in_Servid,
    :in_CFCRecno,
    :in_PropNo,
    :in_MarketPropNo,       
     
        :Out_Errorcode, 
        :Out_Errormsg,
        :Out_Appid,
        :Out_AppliNo);
       END;`,
      bindVars,
      { autoCommit: true }
    );

    res.json({
      OUT_ERRORCODE: result.outBinds.Out_Errorcode,
      OUT_ERRORMSG: result.outBinds.Out_Errormsg,
      OUT_APPID: result.outBinds.Out_Appid,
      OUT_APPLINO: result.outBinds.Out_AppliNo
    });

  } catch (error) {
    console.error("❌ Error executing stored procedure:", error);
    res.status(500).json({
      OUT_ERRORCODE: -110,
      OUT_ERRORMSG: "Error processing application entry",
      ERROR: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("❌ Error closing Oracle connection:", closeErr);
      }
    }
  }
};

module.exports = aomk_appli_ins;
