const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const FrmUserList = async (req, res) => {
    let connection;
    try {
        const { orgId, departmentId } = req.body; 

        // Basic validation for inputs
        if (orgId === undefined || orgId === null || isNaN(orgId)) {
            return res.status(400).json({ error: 'orgId is required and must be a number.' });
        }
        if (departmentId === undefined || departmentId === null || isNaN(departmentId)) {
            return res.status(400).json({ error: 'departmentId is required and must be a number.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                aud.num_user_userid AS userId,
                aud.var_user_username AS userName,
                adm.var_dept_engname AS deptName,
                amdm.var_desigantion_engname AS desgName
            FROM
                admins.aoma_user_def aud
            LEFT JOIN
                admins.aoms_dept_mas adm ON adm.num_dept_id = aud.num_user_deptid
                                         AND aud.num_user_ulbid = adm.num_dept_ulbid
            LEFT JOIN
                admins.aoms_desigantion_mas amdm ON amdm.num_desigantion_id = aud.num_user_desgid
                                                  AND aud.num_user_ulbid = amdm.num_desigantion_ulbid
            WHERE
                aud.num_user_ulbid = :orgId_param
                AND aud.num_user_deptid = :departmentId_param
        `;

        const result = await connection.execute(
            sqlQuery,
            {
                orgId_param: orgId,
                departmentId_param: departmentId
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT } 
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: `No users found for Organization ID '${orgId}' and Department ID '${departmentId}'.`,
                data: []
            });
        }

        res.status(200).json({
            data: result.rows 
        });

    } catch (err) {
        console.error('Error in getUsersByOrgAndDepartment:', err);
        res.status(500).json({ error: 'Failed to fetch user data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getUsersByOrgAndDepartment:', err);
            }
        }
    }
};

module.exports = FrmUserList