const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database"); 

const CorporationDropdown = async (req, res) => {
    let connection;
    try {
        connection = await getConnection();

        const sqlQuery = `
            SELECT
                num_corporation_id AS CorpId,
                var_corporation_name AS Corpname
            FROM
                admins.aoma_corporation_mas
            ORDER BY
                var_corporation_name ASC -- Added an order by for consistent results
        `;

        const result = await connection.execute(
            sqlQuery,
            [], // No bind variables needed for this query
            { outFormat: oracledb.OUT_FORMAT_OBJECT } // Return rows as JavaScript objects
        );

        res.status(200).json({
            message: 'Corporation data fetched successfully',
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getCorporationData:', err);
        res.status(500).json({ error: 'Failed to fetch corporation data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getCorporationData:', err);
            }
        }
    }
};

module.exports = CorporationDropdown;