const oracledb = require('oracledb');
const { getConnection } = require('../../../config/database'); 

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; 

const getUserList = async (req, res) => {
    let connection;
    try {
        const { OrgId } = req.body; 

        if (!OrgId) {
            return res.status(400).json({
                error: 'OrgId is required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                var_user_username AS username,
                num_user_userid AS userid
            FROM
                admins.aoma_user_def
            WHERE
                num_user_ulbid = :OrgId
            ORDER BY
                username
        `;

        const binds = {
            OrgId: OrgId
        };

        const result = await connection.execute(sqlQuery, binds);

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getUserList:', error);
        res.status(500).json({
            error: 'Failed to retrieve user list.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getUserList:', err);
            }
        }
    }
};

module.exports = getUserList