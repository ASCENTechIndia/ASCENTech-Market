const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

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

module.exports = FrmApplicantTypeList