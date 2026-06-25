const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmUlbTipMst = async (req, res) => {
  let connection;

  try {
    const { UlbTipId } = req.body;

    // Validate input
    if (!UlbTipId || isNaN(UlbTipId)) {
      return res.status(400).json({
        errorCode: -300,
        message:
          "Parameter UlbTipId is required in the request body and must be a valid number.",
      });
    }

    connection = await getConnection();

    const sql = `
      SELECT
          num_ulbtip_id,
          num_ulbtip_ulbid,
          var_ulbtip_tip,
          var_ulbtip_slogan,
          var_ulbtip_active,
          var_ulbtip_insby,
          dat_ulbtip_insdate,
          var_ulbtip_updby,
          dat_ulbtip_upddate
      FROM
          aomk_ulbtip_det
      WHERE
          var_ulbtip_active = 'Y'
          AND num_ulbtip_id = :UlbTipId
    `;

    // ✅ Convert possible CLOBs to strings
    const result = await connection.execute(
      sql,
      { UlbTipId: parseInt(UlbTipId, 10) },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          VAR_ULBTIP_TIP: { type: oracledb.STRING },
          VAR_ULBTIP_SLOGAN: { type: oracledb.STRING },
        },
      }
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        errorCode: 0,
        message: "No active ULB tip found for the given UlbTipId.",
        data: [],
      });
    }

    // ✅ Return clean JSON-safe data
    return res.status(200).json({
      errorCode: 9999,
      message: "ULB Tip fetched successfully.",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error in GetUlbTipById:", err.message);

    return res.status(500).json({
      errorCode: -110,
      message: "Failed to retrieve ULB Tip.",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection in GetUlbTipById:", err.message);
      }
    }
  }
};

const FrmUlbTipList = async (req, res) => {
  let connection;
  try {
    const in_ulbid = req.body.UlbId;

    if (!in_ulbid || isNaN(in_ulbid)) {
      return res.status(400).json({
        errorCode: -300,
        message: "Parameter UlbId is required and must be a valid number.",
      });
    }

    connection = await getConnection();

    const sql = `
      SELECT
          num_ulbtip_id,
          num_ulbtip_ulbid,
          var_ulbtip_tip,
          var_ulbtip_slogan,
          var_ulbtip_active,
          var_ulbtip_insby,
          dat_ulbtip_insdate,
          var_ulbtip_updby,
          dat_ulbtip_upddate
      FROM
          aomk_ulbtip_det
      WHERE
          num_ulbtip_ulbid = :in_ulbid
          AND var_ulbtip_active = 'Y'
    `;

    const result = await connection.execute(
      sql,
      { in_ulbid: parseInt(in_ulbid, 10) },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
        fetchInfo: {
          VAR_ULBTIP_TIP: { type: oracledb.STRING },
          VAR_ULBTIP_SLOGAN: { type: oracledb.STRING },
        },
      }
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        errorCode: 0,
        message: "No active ULB tips found for the given UlbId.",
        data: [],
      });
    }

    res.status(200).json({
      errorCode: 9999,
      message: "Active ULB tips fetched successfully.",
      data: result.rows,
    });
  } catch (err) {
    console.error("Error fetching active ULB tips:", err.message);

    res.status(500).json({
      errorCode: -110,
      message: "Failed to retrieve active ULB tips.",
      details: err.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err.message);
      }
    }
  }
};

const aomk_ulbtip_ins = async (req, res, next) => {
    let connection;
    try {
        // --- Input Validation based on the Oracle Procedure's IN parameters ---

        // In_UserId validation
        if (!req.body.in_userid || typeof req.body.in_userid !== 'string' || req.body.in_userid.trim() === '') {
            console.error('Validation Error: in_userid is missing or invalid.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter UserId is not set.'
            });
        }

        // In_ulbid validation
        if (req.body.in_ulbid === undefined || req.body.in_ulbid === null || typeof req.body.in_ulbid !== 'number') {
            console.error('Validation Error: in_ulbid is missing or not a number.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter ulbid is not set or invalid type.'
            });
        }

        // In_tip validation
        // Note: Oracle LONG type can handle large strings, Node.js strings map fine.
        if (!req.body.in_tip || typeof req.body.in_tip !== 'string' || req.body.in_tip.trim() === '') {
            console.error('Validation Error: in_tip is missing or invalid.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter tip is not set.'
            });
        }

        // In_slogan validation
        // Note: Oracle LONG type can handle large strings, Node.js strings map fine.
        if (!req.body.in_slogan || typeof req.body.in_slogan !== 'string' || req.body.in_slogan.trim() === '') {
            console.error('Validation Error: in_slogan is missing or invalid.');
            return res.status(400).json({
                Out_Errorcode: -190,
                Out_Errormsg: 'Parameter slogan is not set.'
            });
        }

        // In_status validation (optional based on requirement, assuming 'Y'/'N' or similar)
        if (!req.body.in_status || typeof req.body.in_status !== 'string' || !['Y', 'N'].includes(req.body.in_status.toUpperCase())) {
             // Default to 'Y' if not provided or invalid, but log a warning.
            console.warn('Validation Warning: in_status is missing or invalid. Defaulting to "Y".');
            req.body.in_status = 'Y'; 
        }

        // In_mode validation (must be 1 or 2)
        if (req.body.in_mode === undefined || req.body.in_mode === null || ![1, 2].includes(req.body.in_mode)) {
            console.error('Validation Error: in_mode is missing or invalid. Must be 1 (Insert) or 2 (Update).');
            return res.status(400).json({
                Out_Errorcode: -191, // Custom error code for mode validation
                Out_Errormsg: 'Parameter Mode (in_mode) must be 1 for Insert or 2 for Update.'
            });
        }

        connection = await getConnection();

        const sql = `
            BEGIN
              aomk_ulbtip_ins(
                in_userid       => :inUserId,
                in_ulbid        => :inUlbid,
                in_tip          => :inTip,
                in_slogan       => :inSlogan,
                in_status       => :inStatus,
                in_ipaddress    => :inIpaddress,
                in_source       => :inSource,
                in_mode         => :inMode,
                out_errorcode   => :outErrorcode,
                out_errormsg    => :outErrormsg
              );
            END;
        `;

        const binds = {
            inUserId: req.body.in_userid,
            inUlbid: req.body.in_ulbid,
            inTip: req.body.in_tip,
            inSlogan: req.body.in_slogan,
            inStatus: req.body.in_status.toUpperCase(), // Ensure 'Y' or 'N' is uppercase for consistency
            inIpaddress: req.ip || '127.0.0.1', // Get client IP or default to localhost
            inSource: req.body.in_source || 'NODEJS_API', // Default source if not provided
            inMode: req.body.in_mode,
            outErrorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            outErrormsg: { dir: oracledb.BIND_OUT, type: oracledb.VARCHAR2, maxSize: 500 }
        };

        // Auto-commit is generally false for DML operations.
        // We will manually commit/rollback based on procedure's output.
        const options = {
            autoCommit: false
        };

        const result = await connection.execute(sql, binds, options);

        const outErrorcode = result.outBinds.outErrorcode;
        const outErrormsg = result.outBinds.outErrormsg;

        if (outErrorcode === 9999) {
            await connection.commit(); // Commit transaction on success
            res.status(200).json({
                Out_Errorcode: outErrorcode,
                Out_Errormsg: outErrormsg
            });
        } else {
            await connection.rollback(); // Rollback transaction on procedure error
            console.error(`Oracle Procedure Error: Code ${outErrorcode}, Message: ${outErrormsg}`);
            // Use 400 for client-side errors based on procedure's business logic
            res.status(400).json({
                Out_Errorcode: outErrorcode,
                Out_Errormsg: outErrormsg
            });
        }

    } catch (err) {
        console.error('Error in aomk_ulbtip_ins (route handler):', err);
        // Rollback any pending transaction if a JavaScript error occurred
        if (connection) {
            try {
                await connection.rollback();
                console.log('Transaction rolled back due to application error.');
            } catch (rollbackErr) {
                console.error('Error during rollback:', rollbackErr);
            }
        }
        // Send a 500 Server Error response
        res.status(500).json({
            Out_Errorcode: -999, // General server error code
            Out_Errormsg: `Server Error: ${err.message}`
        });
    } finally {
        // Ensure connection is closed whether successful or not
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed.');
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};

module.exports = { FrmUlbTipMst, FrmUlbTipList, aomk_ulbtip_ins };
