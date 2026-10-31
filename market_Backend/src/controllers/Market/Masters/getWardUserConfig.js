const oracledb = require('oracledb');
const { getConnection } = require('../../../config/database'); 

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; 

const getWardUserConfig = async (req, res) => {
    let connection;
    try {
        const {
            WardId,
            UserId 
        } = req.body;

        // Basic validation for all required fields
        if (!WardId || !UserId) {
            return res.status(400).json({
                error: 'WardId and UserId are required in the request body.'
            });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_warduser_id,
                num_warduser_userid,
                num_warduser_wardid,
                num_warduser_zoneid,
                num_warduser_ulbid
            FROM
                aomk_warduser_config
            WHERE
                num_warduser_wardid = :WardId
                AND num_warduser_userid = :UserId
        `;

        const binds = {
            WardId: WardId,
            UserId: UserId
        };

        const result = await connection.execute(sqlQuery, binds);

        res.json(result.rows);

    } catch (error) {
        console.error('API Error in getWardUserConfig:', error);
        res.status(500).json({
            error: 'Failed to retrieve ward user configuration.',
            details: error.message
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getWardUserConfig:', err);
            }
        }
    }
};

module.exports = getWardUserConfig