const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmServiceMapMst = async (req, res) => {
  let connection;

  try {
    const { SerAccMapId } = req.body;

    // --- Validation ---
    if (!SerAccMapId || isNaN(SerAccMapId)) {
      return res.status(400).json({
        errorCode: -300,
        message:
          "Parameter 'SerAccMapId' is required in the request body and must be a valid number.",
      });
    }

    connection = await getConnection();

    const sql = `
            SELECT
                num_serviceaccmap_id,
                num_serviceaccmap_ulbid,
                num_serviceaccmapp_servid,
                var_serviceaccmap_glcode,
                var_serviceaccmap_accno
            FROM
                aomk_serviceAccmap_det
            WHERE
                num_serviceaccmap_id = :SerAccMapId
        `;

    const result = await connection.execute(
      sql,
      { SerAccMapId: parseInt(SerAccMapId, 10) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        errorCode: 0,
        message: "No record found for the given Service Account Map ID.",
        data: [],
      });
    }

    res.status(200).json({
      errorCode: 9999,
      message: "Service account mapping fetched successfully.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in FrmServiceMapMst:", err);

    res.status(500).json({
      errorCode: -110,
      message: "Failed to retrieve service account mapping.",
      details:
        err.message || JSON.stringify(err, Object.getOwnPropertyNames(err)),
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection in FrmServiceMapMst:", err);
      }
    }
  }
};

const aomk_serviceaccmap_ins = async (req, res) => {
  let connection;

  try {
    const {
      in_UserId,
      in_ServiceaccmapId,
      in_Ulbid,
      in_Servid,
      in_GlCode,
      in_AccNo,
      in_Mode,
      in_ipaddress,
      in_source,
    } = req.body;

    connection = await getConnection();

    const result = await connection.execute(
      `
      BEGIN
        aomk_serviceaccmap_ins(
          :in_UserId,
          :in_ServiceaccmapId,
          :in_Ulbid,
          :in_Servid,
          :in_GlCode,
          :in_AccNo,
          :in_Mode,
          :in_ipaddress,
          :in_source,
          :out_ErrorCode,
          :out_ErrorMsg
        );
      END;
      `,
      {
        in_UserId: {
          val: in_UserId,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        in_ServiceaccmapId: {
          val: in_ServiceaccmapId,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        in_Ulbid: {
          val: in_Ulbid,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        in_Servid: {
          val: in_Servid,
          dir: oracledb.BIND_IN,
          type: oracledb.NUMBER,
        },
        in_GlCode: {
          val: in_GlCode,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        in_AccNo: {
          val: in_AccNo,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        in_Mode: { val: in_Mode, dir: oracledb.BIND_IN, type: oracledb.NUMBER },
        in_ipaddress: {
          val: in_ipaddress,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        in_source: {
          val: in_source,
          dir: oracledb.BIND_IN,
          type: oracledb.STRING,
        },
        out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        out_ErrorMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 200,
        },
      }
    );

    res.status(200).json({
      success: true,
      errorcode: result.outBinds.out_ErrorCode,
      errormsg: result.outBinds.out_ErrorMsg,
    });
  } catch (err) {
    console.error("Error in aomkServiceAccMapIns:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message,
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

const getServices = async (req, res) => {
  let connection;
  let result;

  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT
        var_serv_name AS serviceName,
        num_serv_id AS serviceId
      FROM
        aomk_service_mas
      ORDER BY
        num_serv_id -- Order by service ID as per your query
    `;

    result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return results as JavaScript objects
    });

    res.status(200).json({
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    // Send a 500 Internal Server Error response
    if (!res.headersSent) {
      // Prevent "Cannot set headers after they are sent" error
      const clientError = {
        message:
          error.message || "An unexpected internal server error occurred.",
      };
      if (error.code) {
        clientError.code = error.code;
      }
      if (error.errorNum) {
        clientError.oracleErrorNum = error.errorNum;
      }
      res.status(500).json({
        success: false,
        message: "Internal Server Error during fetching services.",
        error: clientError,
      });
    }
  }
};

const FrmServiceMapList = async (req, res) => {
  let connection;

  try {
    const { ulbid } = req.body;

    // Validation
    if (!ulbid || isNaN(ulbid)) {
      return res.status(400).json({
        errorCode: -300,
        message:
          "Parameter 'ulbid' is required in the request body and must be a valid number.",
      });
    }

    connection = await getConnection();

    const sql = `
            SELECT 
                num_serviceaccmap_id,
                var_serv_name,
                num_serviceaccmap_ulbid,
                num_serviceaccmapp_servid,
                var_serviceaccmap_glcode,
                var_serviceaccmap_accno
            FROM 
                aomk_serviceAccmap_det
            INNER JOIN 
                aomk_service_mas 
            ON 
                num_serv_id = num_serviceaccmapp_servid
            WHERE 
                num_serviceaccmap_ulbid = :ulbid
        `;

    const result = await connection.execute(
      sql,
      { ulbid: parseInt(ulbid, 10) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        errorCode: 0,
        message: "No service account mappings found for the given ulbid.",
        data: [],
      });
    }

    res.status(200).json({
      errorCode: 9999,
      message: "Service account mappings fetched successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Error in FrmServiceMapList:", err);

    res.status(500).json({
      errorCode: -110,
      message: "Failed to retrieve service account mappings.",
      details:
        err.message || JSON.stringify(err, Object.getOwnPropertyNames(err)),
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection in FrmServiceMapList:", err);
      }
    }
  }
};
module.exports = {
  FrmServiceMapMst,
  aomk_serviceaccmap_ins,
  getServices,
  FrmServiceMapList,
};
