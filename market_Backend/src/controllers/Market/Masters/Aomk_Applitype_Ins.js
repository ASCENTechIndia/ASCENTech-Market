const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const Aomk_Applitype_Ins = async (req, res) => {
  let connection;

  try {
    const {
      In_Userid,
      In_Mode,
      In_ApplitypeId,
      In_Applitypename,
      In_Applitypeflag,
      In_orgid,
      in_ipaddr,
      in_source
    } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        Aomk_Applitype_Ins(
          :In_Userid,
          :In_Mode,
          :In_ApplitypeId,
          :In_Applitypename,
          :In_Applitypeflag,
          :In_orgid,
          :in_ipaddr,
          :in_source,
          :Out_Errorcode,
          :Out_Errormsg
        );
      END;
      `,
      {
        In_Userid:        { val: In_Userid, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_Mode:          { val: In_Mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_ApplitypeId:   { val: In_ApplitypeId, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        In_Applitypename: { val: In_Applitypename, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_Applitypeflag: { val: In_Applitypeflag, dir: oracledb.BIND_IN, type: oracledb.STRING },
        In_orgid:         { val: In_orgid, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_ipaddr:        { val: in_ipaddr, dir: oracledb.BIND_IN, type: oracledb.STRING },
        in_source:        { val: in_source, dir: oracledb.BIND_IN, type: oracledb.STRING },
        Out_Errorcode:    { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_Errormsg:     { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 200 }
      }
    );

    res.status(200).json({
      success: true,
      errorcode: result.outBinds.Out_Errorcode,
      errormsg: result.outBinds.Out_Errormsg
    });

  } catch (error) {
    console.error("Error in aomkApplitypeIns:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing DB connection:", closeErr);
      }
    }
  }
};

const FrmApplicantTypeList = async (req, res) => {
    let connection;
    try {
        const { orgId } = req.body; 

        if (orgId === undefined || orgId === null || isNaN(orgId)) {
            return res.status(400).json({ error: 'orgId is required and must be a number in the request body.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_applitype_id AS applicitypeid,
                var_applitype_name AS applicitypename,
                CASE var_applitype_flag
                    WHEN 'Y' THEN 'Active'
                    WHEN 'N' THEN 'Inactive'
                END AS applicitypeflag
            FROM
                aomk_applitype_mas
            WHERE
                num_applitype_UlbId = :orgId_param
            ORDER BY
                num_applitype_id DESC
        `;

        const result = await connection.execute(
            sqlQuery,
            { orgId_param: orgId }, // Bind the orgId parameter
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: `No application types found for Organization ID '${orgId}'.`,
                data: []
            });
        }

        res.status(200).json({
            data: result.rows 
        });

    } catch (err) {
        console.error('Error in getApplicationTypesByOrgId:', err);
        res.status(500).json({ error: 'Failed to fetch application types', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getApplicationTypesByOrgId:', err);
            }
        }
    }
};

const FrmApplicantTypeMst = async (req, res) => {
    let connection;
    try {
        const { appliTypeId, orgId } = req.body;

        if (appliTypeId === undefined || appliTypeId === null || isNaN(appliTypeId)) {
            return res.status(400).json({ error: 'appliTypeId is required and must be a number.' });
        }
        if (orgId === undefined || orgId === null || isNaN(orgId)) {
            return res.status(400).json({ error: 'orgId is required and must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_applitype_id AS appliTypeId,
                var_applitype_name AS appliTypeName,
                var_applitype_flag AS appliTypeFlag
            FROM
                aomk_applitype_mas
            WHERE
                num_applitype_UlbId = :orgId_param
                AND num_applitype_id = :appliTypeId_param
        `;


        const result = await connection.execute(
            sqlQuery,
            { appliTypeId_param: appliTypeId, orgId_param: orgId }, 
            { outFormat: oracledb.OUT_FORMAT_OBJECT } 
        );


        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No application type data found for AppliType ID '${appliTypeId}' in Organization ID '${orgId}'.` });
        }

        res.status(200).json({
            data: result.rows[0] 
        });

    } catch (err) {
        console.error('Error in getSingleApplicationTypeData:', err);
        res.status(500).json({ error: 'Failed to fetch single application type data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getSingleApplicationTypeData:', err);
            }
        }
    }
};

module.exports = {Aomk_Applitype_Ins, FrmApplicantTypeList, FrmApplicantTypeMst}
