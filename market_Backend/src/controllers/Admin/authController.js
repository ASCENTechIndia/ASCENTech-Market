const oracledb = require("oracledb");
const { getConnection } = require("../../../src/config/database");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken"); // Import JWT
const encrypt = require("../../middleware/authMiddleware");
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jwksRsa = require("jwks-rsa");
const { expressjwt: jwtMiddleware } = require("express-jwt");
const logger = require("../../routes/logger");

const JWT_SECRET = process.env.JWT_SECRET;
const {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_AUDIENCE, AUTH0_REALM
} = process.env;
const getWardID = async (zoneID) => {
  let connection;
  try {
    connection = await getConnection();
    const query =
      "SELECT num_zone_wardid FROM PROP.aoms_zone_mas WHERE num_zone_id = :zoneID";
    const result = await connection.execute(query, [zoneID], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    if (result.rows.length > 0) {
      return result.rows[0].NUM_ZONE_WARDID;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Ward ID:", error);
    return null;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

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
      IN_HOSTNAME: "cfc.nagarkaryavalinewuat.com",
      IN_SOURCE: "RW",
      IN_DEPTID: "21",

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

    // Fetch the Ward ID
    const wardID = await getWardID(result.outBinds.OUT_PRABHAGID);

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
      prabhagID: wardID,//result.outBinds.OUT_PRABHAGID,
      acccounttype: 21,
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

    logger.info(
  `Oracle Collection Center: ${result.outBinds.OUT_COLLECTIONCENTER}`
);

logger.info(
  `UserData Collection Center: ${userData.Out_Collectioncenter}`
);

    // Generate JWT Token
    const token = jwt.sign(
      {
        userId: userData.userId,
           username: userData.Out_UserName,
        userType: userData.userType,
 ulbId: userData.out_OrgId,
    deptId: userData.acccounttype,
    collcenterid: userData.Out_Collectioncenter,
    lastLogin: userData.Out_LastLogin,
    lastLogout: userData.Out_LastLogOut,
    prabhagName: userData.prabhagName,
    prabhagID: userData.prabhagID,
    desigId: userData.desigId, 
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

     logger.info(
      `User data prepared - UserId: ${userData.userId}, ` +
      `ULB ID: ${userData.out_OrgId}, ` +
      `Collection Center: ${userData.Out_Collectioncenter}, ` +
      `Prabhag ID: ${userData.prabhagID}, ` +
      `Designation ID: ${userData.desigId}`
    );
const verifyToken = jwt.verify(token, JWT_SECRET);

logger.info(
  `JWT Collection Center: ${verifyToken.collcenterid}`
);

logger.info(
  `JWT Payload: ${JSON.stringify(verifyToken)}`
);
const origin = req.headers.origin || "";
const isLocalhost = origin.includes("localhost");

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/",
  // maxAge: 15 * 60 * 1000,
};

if (!isLocalhost) {
  cookieOptions.domain = ".nagarkaryavalinewuat.com";
}
logger.info(
  `SETTING CUSTOM ACCESS TOKEN - iat: ${verifyToken.iat}, ` +
  `CollectionCenter: ${verifyToken.collcenterid}`
);
res.cookie("cfc_token", token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/",
  domain: ".nagarkaryavalinewuat.com",
  maxAge: 60 * 60 * 1000,
});

    // console.log("JWT Token Generated:", token);
res.cookie("access_token", token, cookieOptions);

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

const getCurrentUser = async (req, res) => {
  try {
    logger.info("========== /me CALLED ==========");

    const token = req.cookies?.cfc_token;

    logger.info(
      `Access token received: ${token ? "Yes" : "No"}`
    );

    if (!token) {
      logger.warn("/me request failed: Access token not found");

      return res.status(401).json({
        message: "Not authenticated",
      });
    }
logger.info(
  `Cookie token length: ${token ? token.length : 0}`
);

logger.info(
  `Cookie token preview: ${
    token ? `${token.substring(0, 20)}...` : "No token"
  }`
);
    const decoded = jwt.verify(token, JWT_SECRET);
logger.info(
  `ME JWT - UserId: ${decoded.userId}, ` +
  `CollectionCenter: ${decoded.collcenterid}, ` +
  `IssuedAt: ${decoded.iat}`
);
    logger.info(
      `/me token verified successfully for UserId: ${decoded.userId}`
    );

    logger.info(
      `/me user details - ULB ID: ${decoded.ulbId}, ` +
      `User Type: ${decoded.userType}, ` +
      `Collection Center: ${decoded.collcenterid}`
    );

    return res.status(200).json({
      user: decoded,
    });
  } catch (error) {
    logger.error(`/me API error: ${error.message}`);
    logger.error(error.stack);

    return res.status(401).json({
      message: "Session expired",
    });
  }
};

const authLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      grant_type: "http://auth0.com/oauth/grant-type/password-realm",
      username,
      password,
      realm: AUTH0_REALM,
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: AUTH0_AUDIENCE,
      scope: "openid profile email offline_access"
    });

    const { access_token, refresh_token } = response.data;

    const connection = await getConnection();
    const password_final = encrypt.encryptPassword(password);
    console.log("Sending Parameters to Oracle:", { username, password_final });

    const bindParams = {
      IN_USERID: username,
      IN_PASSWORD: password_final,
      IN_MACADDR: "00-14-22-01-23-45",
      IN_IPADDR: "192.168.1.100",
      IN_HOSTNAME: "cfc.nagarkaryavalinewuat.com",
      IN_SOURCE: "RW",
      IN_DEPTID: "21",

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

    // Fetch the Ward ID
    const wardID = await getWardID(result.outBinds.OUT_PRABHAGID);

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
      prabhagID: wardID,//result.outBinds.OUT_PRABHAGID,
      acccounttype: 10,
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


    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: ".nagarkaryavalinewuat.com",
      maxAge: 15 * 60 * 1000
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: ".nagarkaryavalinewuat.com",
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
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
      return res.status(200).json({
      message: "Logged in successfully",
        token,
        user: userData,
        localStorageData
      });
   
  } catch (err) {
    console.error("Auth0 login error:", err.response?.data || err.message);
    res.status(401).json({
  error: "Login failed",
  details: err.response?.data || err.message || err
});

  }
};

// ⛩️ Middleware: verify access_token from cookies
const checkJwt = jwtMiddleware({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5
  }),
  audience: AUTH0_AUDIENCE,
  issuer: `https://${AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
  getToken: req => req.cookies.access_token
});

// ✅ GET /api/me — return decoded Auth0 user info
const getMe = (req, res) => {
  res.json({ user: req.auth });
};

// 🔁 POST /api/refresh — refresh access_token using refresh_token
const refreshToken = async (req, res) => {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token) return res.status(401).json({ error: "No refresh token" });

  try {
    const response = await axios.post(`https://${AUTH0_DOMAIN}/oauth/token`, {
      grant_type: "refresh_token",
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      refresh_token
    });

    res.cookie("access_token", response.data.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      domain: ".nagarkaryavalinewuat.com",
      maxAge: 15 * 60 * 1000
    });

    res.json({ message: "Access token refreshed" });
  } catch (err) {
    console.error("Token refresh failed:", err.response?.data || err.message);
    res.status(401).json({ error: "Refresh token failed" });
  }
};

// 🚪 POST /api/logout — clear cookies
const logout = (req, res) => {
  res.clearCookie("access_token", { domain: ".nagarkaryavalinewuat.com" });
  res.clearCookie("refresh_token", { domain: ".nagarkaryavalinewuat.com" });
  res.status(200).json({ message: "Logged out" });
};

module.exports = { login, getWardID, authLogin, checkJwt, getMe, refreshToken, logout,getCurrentUser };

