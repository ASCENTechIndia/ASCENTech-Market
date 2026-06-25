const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const UserLevelData = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_desigantion_id AS Userlevelid,
                var_desigantion_engname AS Userlevel
            FROM
                admins.aoms_desigantion_mas
            ORDER BY
                var_desigantion_engname ASC -- Added an order by for consistent results
        `;

        const result = await connection.execute(
            sqlQuery,
            [], // No bind variables needed for this query
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );

        res.status(200).json({
            message: 'User level data fetched successfully',
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getUserLevelData:', err);
        res.status(500).json({ error: 'Failed to fetch user level data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getUserLevelData:', err);
            }
        }
    }
};

module.exports = UserLevelData ;