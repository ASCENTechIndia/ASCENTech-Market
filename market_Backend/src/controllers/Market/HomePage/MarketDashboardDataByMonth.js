const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");


const MarketDashboardDataByMonth = async (req, res) => {
    let connection;
    try {
        const { ulbid } = req.body;

        if (!ulbid) {
            return res.status(400).json({ error: 'ULBID is required in the request body.' });
        }

        connection = await getConnection();

        const sqlQuery = `
            SELECT COUNT(RCPTNO) AS RCPTNO,
                   SUM(RECAMOUNT) AS RECAMOUNT,
                   YEAR,
                   MONTH_NAME
            FROM view_marketdashboard
            WHERE ULBID = :ulbid_param
            GROUP BY YEAR, MONTH_NAME
            ORDER BY YEAR DESC,
                     CASE MONTH_NAME
                        WHEN 'January' THEN 1
                        WHEN 'February' THEN 2
                        WHEN 'March' THEN 3
                        WHEN 'April' THEN 4
                        WHEN 'May' THEN 5
                        WHEN 'June' THEN 6
                        WHEN 'July' THEN 7
                        WHEN 'August' THEN 8
                        WHEN 'September' THEN 9
                        WHEN 'October' THEN 10
                        WHEN 'November' THEN 11
                        WHEN 'December' THEN 12
                     END ASC -- Order by month number for correct chronological order
        `;

        const result = await connection.execute(
            sqlQuery,
            { ulbid_param: ulbid },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({
            message: 'Data fetched successfully (Monthly)',
            data: result.rows
        });

    } catch (err) {
        console.error('Error in getMarketDashboardDataByMonth:', err);
        res.status(500).json({ error: 'Failed to fetch data (Monthly)', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection in getMarketDashboardDataByMonth:', err);
            }
        }
    }
};

module.exports = MarketDashboardDataByMonth