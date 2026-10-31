const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 
oracledb.fetchAsString = [oracledb.CLOB]; 

const FrmUlbTipList = async (req, res) => {
    let connection;
    try {
        const in_ulbid = req.body.UlbId;

        if (in_ulbid === undefined || in_ulbid === null || isNaN(in_ulbid)) {
            return res.status(400).json({
                errorCode: -300,
                message: 'Parameter UlbId is required in the request body and must be a valid number.'
            });
        }

        connection = await getConnection();

        const sql = `
            SELECT
                num_ulbtip_id,
                num_ulbtip_ulbid,
                var_ulbtip_tip,       -- Possibly CLOB
                var_ulbtip_slogan,    -- Possibly CLOB
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
                outFormat: oracledb.OUT_FORMAT_OBJECT
                // No need for fetchInfo if fetchAsString is set globally
            }
        );

        if (result.rows.length === 0) {
            return res.status(200).json({
                errorCode: 0,
                message: 'No active ULB tips found for the given UlbId.',
                data: []
            });
        }

        res.status(200).json({
            errorCode: 9999,
            message: 'Active ULB tips fetched successfully.',
            data: result.rows
        });

    } catch (err) {
        console.error('Error fetching active ULB tips (POST - FrmUlbTipList):', err);

        res.status(500).json({
            errorCode: -110,
            message: 'Failed to retrieve active ULB tips.',
            details: err.message || JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in FrmUlbTipList:', err);
            }
        }
    }
};

module.exports = FrmUlbTipList;
