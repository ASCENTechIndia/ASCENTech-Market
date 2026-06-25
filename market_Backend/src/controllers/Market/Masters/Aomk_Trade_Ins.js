// controllers/tradeController.js
const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database");

const Aomk_Trade_Ins = async (req, res) => {
    let connection;

    try {
        const {
            In_Userid,
            In_Mode,
            In_Tradeid, // This will be null for insert, a number for update
            In_Tradename,
            In_Tradeflag,
            In_orgid,
            in_ipaddr,
            in_source
        } = req.body;

        // --- Input Validation ---
        if (!In_Userid || typeof In_Userid !== 'string' || In_Userid.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_Userid'." });
        }
        if (![1, 2].includes(Number(In_Mode))) {
            return res.status(400).json({ success: false, message: "Invalid 'In_Mode'. Must be 1 (Insert) or 2 (Update)." });
        }
        if (!In_Tradename || typeof In_Tradename !== 'string' || In_Tradename.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_Tradename'." });
        }
        if (!In_Tradeflag || typeof In_Tradeflag !== 'string' || In_Tradeflag.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_Tradeflag'." });
        }
        if (!In_orgid || isNaN(Number(In_orgid))) {
            return res.status(400).json({ success: false, message: "Missing or invalid 'In_orgid'." });
        }
        if (!in_ipaddr || typeof in_ipaddr !== 'string' || in_ipaddr.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'in_ipaddr'." });
        }
        if (!in_source || typeof in_source !== 'string' || in_source.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'in_source'." });
        }

        if (Number(In_Mode) === 2 && (In_Tradeid === undefined || isNaN(Number(In_Tradeid)))) {
            return res.status(400).json({ success: false, message: "In 'update' mode, 'In_Tradeid' is required and must be a number." });
        }

        connection = await getConnection();

        // PL/SQL call without bind variables (string interpolation, use only in trusted environments)
        const plsql = `
            DECLARE
                Out_Errorcode NUMBER;
                Out_Errormsg VARCHAR2(500);
            BEGIN
                Aomk_Trade_Ins(
                    In_Userid     => '${In_Userid}',
                    In_Mode       => ${In_Mode},
                    In_Tradeid    => ${In_Tradeid ? In_Tradeid : 'NULL'},
                    In_Tradename  => '${In_Tradename.replace(/'/g, "''")}',
                    In_Tradeflag  => '${In_Tradeflag}',
                    In_orgid      => ${In_orgid},
                    in_ipaddr     => '${in_ipaddr}',
                    in_source     => '${in_source}',
                    Out_Errorcode => Out_Errorcode,
                    Out_Errormsg  => Out_Errormsg
                );
                :out_errorcode := Out_Errorcode;
                :out_errormsg := Out_Errormsg;
            END;
        `;

        const result = await connection.execute(plsql, {
            out_errorcode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
            out_errormsg: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 500 }
        });

        const outErrCode = result.outBinds.out_errorcode;
        const outErrorMessage = result.outBinds.out_errormsg;

        if (outErrCode === 9999) {
            return res.status(200).json({
                success: true,
                message: outErrorMessage,
                errorCode: outErrCode
            });
        } else {
            return res.status(400).json({
                success: false,
                message: outErrorMessage,
                errorCode: outErrCode
            });
        }

    } catch (error) {
        console.error('Error in Aomk_Trade_Ins:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing DB connection:', err);
            }
        }
    }
};

const FrmTradeList = async (req, res) => {
    let connection;
    try {
        const { org_id } = req.body; 

       
        if (!org_id) {
            return res.status(400).json({ error: 'org_id is required in the request body.' });
        }
        if (isNaN(org_id)) {
            return res.status(400).json({ error: 'Invalid org_id provided. Must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_trade_id AS tradeid,
                var_trade_name AS tradename,
                CASE var_trade_flag
                    WHEN 'Y' THEN 'Active'
                    WHEN 'N' THEN 'Inactive'
                END AS tradeflag
            FROM
                aomk_trade_mas
            WHERE
                num_trade_ulbid = :org_id_param
            ORDER BY
                var_trade_name ASC -- Added an order by for consistent results
        `;


        const result = await connection.execute(
            sqlQuery,
            { org_id_param: org_id }, // Pass org_id as a bind variable
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );


        res.status(200).json({
            data: result.rows // Return the array of objects with column names
        });

    } catch (err) {
        console.error('Error in getTradeDataByOrgId:', err);
        res.status(500).json({ error: 'Failed to fetch trade data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getTradeDataByOrgId:', err);
            }
        }
    }
};

const FrmTradeMst = async (req, res) => {
    let connection;
    try {
        const { trade_id, org_id } = req.body; 

        // Validate inputs
        if (!trade_id || !org_id) {
            return res.status(400).json({ error: 'Both trade_id and org_id are required in the request body.' });
        }
        if (isNaN(trade_id) || isNaN(org_id)) {
            return res.status(400).json({ error: 'Invalid trade_id or org_id provided. Must be numbers.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_trade_id AS tradeid,
                var_trade_name AS tradename,
                var_trade_flag AS tradeflag -- Returning 'Y' or 'N' directly as per your query
            FROM
                aomk_trade_mas
            WHERE
                num_trade_id = :trade_id_param
                AND num_trade_ulbid = :org_id_param
        `;

        const result = await connection.execute(
            sqlQuery,
            { trade_id_param: trade_id, org_id_param: org_id }, // Pass both as bind variables
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );


        // If no data is found, return 404
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No trade data found for Trade ID '${trade_id}' in Organization ID '${org_id}'.` });
        }

        // Return the first (and likely only) row found, or the whole array if multiple matches are expected
        res.status(200).json({
            data: result.rows[0] // Assuming trade_id is unique per org_id, return the first object
        });

    } catch (err) {
        console.error('Error in getSingleTradeData:', err);
        res.status(500).json({ error: 'Failed to fetch single trade data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getSingleTradeData:', err);
            }
        }
    }
};

module.exports = {Aomk_Trade_Ins, FrmTradeList, FrmTradeMst};
