const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database"); 

const PrintCollectionReceipt = async (req, res) => {
    let connection;

    try {
        // 1. Extract parameters from request body
        const { licId, licNo, corporationId, recNo } = req.body;

        // 2. Basic Input Validation
        if (!licId || typeof licId !== 'string' || licId.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'licId' in request body." });
        }
        if (!licNo || typeof licNo !== 'string' || licNo.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'licNo' in request body." });
        }
        if (!corporationId || isNaN(Number(corporationId))) {
            return res.status(400).json({ success: false, message: "Missing or invalid 'corporationId' in request body. Must be a number." });
        }
        if (!recNo || typeof recNo !== 'string' || recNo.trim() === '') {
            return res.status(400).json({ success: false, message: "Missing or invalid 'recNo' in request body." });
        }

        connection = await getConnection();

        // 3. Define the SQL query with bind variables
        const sql = `
            SELECT
                var_recipt_rcptno AS RecptNo,
                TRUNC(dat_recipt_insdate) AS RecptDate,
                num_recipt_amount AS Amount,
                var_recipt_insby AS UserName,
                '0' AS Type,
                var_appli_placeownername AS appentryname,
                var_chargesname_namem AS ChargesName,
                num_chargesname_id,
                var_recmode_name AS paymode,
                bank_name,
                var_recipt_instrumentno AS instrumentno,
                dat_recipt_instrumentdate AS instrumentdate,
                var_appli_oldlicencno AS licenseno,
                zone.zonename,
                var_appli_shopname AS shopname,
                var_appli_shopnamemar AS shopnamemar,
                var_applidirector_name AS director_name,
                CASE
                    WHEN var_appli_type = 'N' THEN 'New'
                    WHEN var_appli_type = 'R' THEN 'Renewal'
                END AS lictype,
                var_recipt_remark AS remark
            FROM
                aomk_recipt_def
            LEFT JOIN
                aomk_chargesname_def b ON num_recipt_chargslabid = b.num_chargesname_id
            INNER JOIN
                aomk_appli_mas ON num_appli_id = num_recipt_appliid AND num_recipt_applino = var_appli_applino
            LEFT JOIN
                prop.aoms_recmode_mas ON num_recmode_id = num_recipt_paymode
            LEFT JOIN
                prop.vw_bankconfig ON bank_id = num_recipt_banknameid AND ulbid = num_recipt_ulbid
            INNER JOIN
                aomk_mktlice_mas ON num_mktlice_appliid = num_recipt_appliid AND num_mktlice_ulbid = num_recipt_ulbid
            INNER JOIN
                prop.vw_zonemas zone ON zone.zoneid = num_appli_zoneid AND zone.ulbid = num_appli_ulbid
            LEFT JOIN
                aomk_applidirector_det ON num_applidirector_appliid = num_appli_id AND num_applidirector_ulbid = num_appli_ulbid
            WHERE
                num_mktlice_id = :licId_1
                AND var_mktlice_licenceno = :licNo_1
                AND num_appli_ulbid = :corporationId_1
                AND var_recipt_rcptno = :recNo_1

            UNION ALL

            SELECT
                var_recipt_rcptno AS RecptNo,
                TRUNC(dat_recipt_insdate) AS RecptDate,
                num_recipt_amount AS Amount,
                var_recipt_insby AS UserName,
                '1' AS Type, -- This is the differentiating column
                var_appli_placeownername AS appentryname,
                var_chargesname_namem AS ChargesName,
                num_chargesname_id,
                var_recmode_name AS paymode,
                bank_name,
                var_recipt_instrumentno AS instrumentno,
                dat_recipt_instrumentdate AS instrumentdate,
                var_appli_oldlicencno AS licenseno,
                zone.zonename,
                var_appli_shopname AS shopname,
                var_appli_shopnamemar AS shopnamemar,
                var_applidirector_name AS director_name,
                CASE
                    WHEN var_appli_type = 'N' THEN 'New'
                    WHEN var_appli_type = 'R' THEN 'Renewal'
                END AS lictype,
                var_recipt_remark AS remark
            FROM
                aomk_recipt_def
            LEFT JOIN
                aomk_chargesname_def b ON num_recipt_chargslabid = b.num_chargesname_id
            INNER JOIN
                aomk_appli_mas ON num_appli_id = num_recipt_appliid AND num_recipt_applino = var_appli_applino
            LEFT JOIN
                prop.aoms_recmode_mas ON num_recmode_id = num_recipt_paymode
            LEFT JOIN
                prop.vw_bankconfig ON bank_id = num_recipt_banknameid AND ulbid = num_recipt_ulbid
            INNER JOIN
                aomk_mktlice_mas ON num_mktlice_appliid = num_recipt_appliid AND num_mktlice_ulbid = num_recipt_ulbid
            INNER JOIN
                prop.vw_zonemas zone ON zone.zoneid = num_appli_zoneid AND zone.ulbid = num_appli_ulbid
            LEFT JOIN
                aomk_applidirector_det ON num_applidirector_appliid = num_appli_id AND num_applidirector_ulbid = num_appli_ulbid
            WHERE
                num_mktlice_id = :licId_2
                AND var_mktlice_licenceno = :licNo_2
                AND num_appli_ulbid = :corporationId_2
                AND var_recipt_rcptno = :recNo_2
        `;

        // 4. Define binds for the query (same values for both sides of UNION ALL)
        const binds = {
            licId_1: licId,
            licNo_1: licNo,
            corporationId_1: Number(corporationId),
            recNo_1: recNo,
            licId_2: licId,
            licNo_2: licNo,
            corporationId_2: Number(corporationId),
            recNo_2: recNo
        };


        const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT // Return results as an array of objects
        });

        if (result.rows.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Receipt details retrieved successfully.",
                data: result.rows
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No receipt details found for the given criteria."
            });
        }

    } catch (error) {
        console.error('Error in getUnionReceiptDetails:', error);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred while retrieving receipt details.',
            errorDetail: error.message
        });
    } 
};

module.exports = PrintCollectionReceipt