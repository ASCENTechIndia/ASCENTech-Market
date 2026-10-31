const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

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

module.exports = FrmApplicantTypeMst