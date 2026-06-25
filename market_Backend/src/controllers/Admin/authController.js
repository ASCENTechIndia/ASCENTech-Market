const oracledb = require("oracledb");
const { getConnection } = require("../../config/database");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken"); // Import JWT
const encrypt = require("../../middleware/authMiddleware");

const JWT_SECRET = process.env.JWT_SECRET;

// Login Function
const login = async (req, res) => {
  const { in_UserId, in_password } = req.body;
  console.log(req.body);
  try {
    const connection = await getConnection();
    const password_final = encrypt.encryptPassword(in_password);
    console.log("Sending Parameters to Oracle:", { in_UserId, password_final });

    const bindParams = {
      IN_USERID: in_UserId,
      IN_PASSWORD: password_final,
      IN_MACADDR: "00-14-22-01-23-45",
      IN_IPADDR: "192.168.1.100",
      IN_HOSTNAME: "localhost",
      IN_SOURCE: "WEB",
      IN_DEPTID: "18",

      OUT_USERNAME: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_USERID: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_LASTLOGIN: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_LASTLOGOUT: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_CORPORATION: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_CORPORATIONADDRESS: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_RECEIPTOFFICENAME: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_CHALANOFFICENAME: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_PRABHAGNAME: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_PRABHAGID: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_DESIGID: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_USERTYPE: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_COLLECTIONCENTER: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      OUT_MOBILENO: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_OTPVALIDATE: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_ERRORCODE: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      OUT_ERRORMSG: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
      OUT_ORGID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      OUT_FORCEFULLPASSCHAGE: {
        dir: oracledb.BIND_OUT,
        type: oracledb.STRING,
        maxSize: 255,
      },
    };

    console.log("Calling Oracle Stored Procedure...");
    const result = await connection.execute(
      `BEGIN admins.aoma_login_fetch(
        :IN_USERID, :IN_PASSWORD, :IN_MACADDR, :IN_IPADDR, :IN_HOSTNAME, :IN_SOURCE, :IN_DEPTID,
        :OUT_USERNAME, :OUT_USERID, :OUT_LASTLOGIN, :OUT_LASTLOGOUT, :OUT_CORPORATION, :OUT_CORPORATIONADDRESS,
        :OUT_RECEIPTOFFICENAME, :OUT_CHALANOFFICENAME, :OUT_PRABHAGNAME, :OUT_PRABHAGID, :OUT_DESIGID, :OUT_USERTYPE,
        :OUT_COLLECTIONCENTER, :OUT_MOBILENO, :OUT_OTPVALIDATE, :OUT_ERRORCODE, :OUT_ERRORMSG, :OUT_ORGID, :OUT_FORCEFULLPASSCHAGE
      ); END;`,
      bindParams
    );

    await connection.close();
    console.log("Oracle Response:", result.outBinds);

    if (result.outBinds.OUT_ERRORCODE !== 9999) {
      return res.status(401).json({ message: result.outBinds.OUT_ERRORMSG });
    }

    const userData = {
      Out_UserName: result.outBinds.OUT_USERNAME,
      userId: result.outBinds.OUT_USERID,
      Out_LastLogin: result.outBinds.OUT_LASTLOGIN,
      Out_LastLogOut: result.outBinds.OUT_LASTLOGOUT,
      corporation: result.outBinds.OUT_CORPORATION,
      corporationAddress: result.outBinds.OUT_CORPORATIONADDRESS,
      receiptOfficeName: result.outBinds.OUT_RECEIPTOFFICENAME,
      chalanOfficeName: result.outBinds.OUT_CHALANOFFICENAME,
      prabhagName: result.outBinds.OUT_PRABHAGNAME,
      prabhagID: result.outBinds.OUT_PRABHAGID,
      acccounttype: 18,
      userType: result.outBinds.OUT_USERTYPE,
      Out_Collectioncenter: result.outBinds.OUT_COLLECTIONCENTER, // Assign Ward ID to Collection Center
      mobileNo: result.outBinds.OUT_MOBILENO,
      otpValidate: result.outBinds.OUT_OTPVALIDATE,
      errorCode: result.outBinds.OUT_ERRORCODE,
      errorMsg: result.outBinds.OUT_ERRORMSG,
      out_OrgId: result.outBinds.OUT_ORGID,
      forceFullPassChange: result.outBinds.OUT_FORCEFULLPASSCHAGE,
    };

    console.log("Storing Data in LocalStorage:", {
      ulbId: userData.out_OrgId,
      deptId: bindParams.IN_DEPTID,
      userId: userData.userId,
      prabhagName: userData.prabhagName,
      callcenterId: userData.Out_Collectioncenter, // Corrected callcenter ID
    });

    // Local storage data
    const localStorageData = {
      ulbId: userData.out_OrgId,
      deptId: bindParams.IN_DEPTID,
      userId: userData.userId,
      prabhagName: userData.prabhagName,
      callcenterId: userData.Out_Collectioncenter, // Ensure callcenterId is stored
    };

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: userData.userId,
        userName: userData.Out_UserName,
        userType: userData.userType,
        orgId: userData.out_OrgId,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    console.log("JWT Token Generated:", token);

    // Send response with token and data for localStorage
    return res.status(200).json({
      token,
      user: userData,
      localStorageData, // Send this so frontend can store it
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { login };
