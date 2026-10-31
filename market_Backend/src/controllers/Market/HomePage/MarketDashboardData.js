const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

// Function to get market dashboard data
const MarketDashboardData = async (req, res) => {
    let connection;
    try {
        const { ulbid } = req.body;

        // Basic validation for ulbid
        if (!ulbid) {
            return res.status(400).json({ error: 'ULBID is required in the request body.' });
        }

        // Get a connection from the pool
        connection = await getConnection();

        const sqlQuery = `
            SELECT COUNT(RCPTNO) AS RCPTNO,
                   SUM(RECAMOUNT) AS RECAMOUNT,
                   YEAR
            FROM view_marketdashboard
            WHERE ULBID = :ulbid_param
            GROUP BY YEAR
            ORDER BY YEAR DESC
        `;

        // Execute the query with a bind variable
        const result = await connection.execute(
            sqlQuery,
            { ulbid_param: ulbid },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({
            message: 'Data fetched successfully',
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getMarketDashboardData:', err);
        res.status(500).json({ error: 'Failed to fetch data', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close(); // Release the connection back to the pool
            } catch (err) {
                console.error('Error closing connection in getMarketDashboardData:', err);
            }
        }
    }
};

module.exports = MarketDashboardData