const oracledb = require('oracledb');
const { getConnection } = require('../../../src/config/database'); // Adjust the import path as needed


async function isValidToken(req,res) {
     const tokenno = req.cookies["access_token"];
  let connection;
  let result = {
   // isValid: false,
    userid: '',
    password: '',
    errorCode: '',
    errorMsg: ''
  };

  try {
    connection = await getConnection();

    const binds = {
      in_mode: 2,
      in_userid: '',
      in_UserPassword: '',
      in_tokenno: tokenno,
      in_ipaddress: '',
      in_requestloginurl: '',
      in_requestfromurl: '',
      in_deptFlag: '',
      out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      out_ErrorMsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 3000 },
      out_userid: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 3000 },
      out_encpassword: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 3000 }
    };
console.log("binds",binds)
   const res1= await connection.execute(
      `BEGIN admins.aoma_singlelogintoken_ins(
        :in_mode, :in_userid, :in_UserPassword, :in_tokenno,
        :in_ipaddress, :in_requestloginurl, :in_requestfromurl, :in_deptFlag,
        :out_ErrorCode, :out_ErrorMsg, :out_userid, :out_encpassword
      ); END;`,
      binds
    );
console.log("result", res)
    result.errorCode = res.out_ErrorCode;
    result.errorMsg = res.out_ErrorMsg;
    result.userid = res.out_userid;
    result.password = res.out_encpassword;
res.status(200).json(res1);

    // if (result.errorCode === 9999) {
    //   result.isValid = true;
    // }
  } catch (err) {
    result.errorMsg = 'Server Error';
    console.error('Error in isValidToken:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing DB connection:', err);
      }
    }
  }

 // return result;
}

module.exports =  isValidToken ;
