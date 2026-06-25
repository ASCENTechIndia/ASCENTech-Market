const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const MarketDashboardDataByYear = async (req, res) => {
    let connection;
    try {
        const { ulbid, year } = req.body;

        // Validate ulbid
        if (!ulbid) {
            return res.status(400).json({ error: 'ULBID is required in the request body.' });
        }

        // --- UPDATED VALIDATION FOR STRICT YY_YY FORMAT ---
        if (!year) {
            return res.status(400).json({ error: 'YEAR is required in the request body.' });
        }

        const yearString = String(year); // Ensure year is treated as a string

        // Regex to strictly match the 'YY_YY' format, e.g., '24_25'
        // \d{2} matches exactly two digits
        // _ matches the underscore literally
        if (!yearString.match(/^\d{2}_\d{2}$/)) {
            return res.status(400).json({
                error: 'Invalid YEAR format. Please pass the year in YY_YY format (e.g., 24_25, 25_26).'
            });
        }

        // If validation passes, the year is already in the correct format for the DB
        const formattedYearForDb = yearString;

        connection = await getConnection(); // Get connection from your centralized function

        const sqlQuery = `
            SELECT COUNT(RCPTNO) AS RCPTNO,
                   SUM(RECAMOUNT) AS RECAMOUNT,
                   YEAR,
                   MONTH_NAME
            FROM view_marketdashboard
            WHERE ULBID = :ulbid_param
            AND YEAR = :year_param -- Will directly use the YY_YY string passed by the user
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
                     END ASC
        `;

        const result = await connection.execute(
            sqlQuery,
            { ulbid_param: ulbid, year_param: formattedYearForDb }, // Pass the user-provided YY_YY string
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.status(200).json({
            message: `Monthly data for ULBID '${ulbid}' in year '${formattedYearForDb}' fetched successfully`,
            data: result.rows
        });

    } catch (err) {
        console.error('Error in MarketDashboardDataByYear:', err);
        res.status(500).json({ error: 'Failed to fetch monthly data by year', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close(); // Release the connection back to the pool
            } catch (err) {
                console.error('Error closing connection in MarketDashboardDataByYear:', err);
            }
        }
    }
};

module.exports = MarketDashboardDataByYear;