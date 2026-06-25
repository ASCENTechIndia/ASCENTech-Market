const oracledb = require('oracledb');
const { getConnection } = require("../../../config/database");

const getDailyMarketDashboardDataByMonth = async (req, res) => {
    let connection;
    try {
        const { ulbid, financial_year, month_name } = req.body;

        console.log("📥 Incoming Request Body:", req.body);

        // Step 1: Validate all required inputs
        if (!ulbid || !financial_year || !month_name) {
            console.error("❌ Missing required parameters.");
            return res.status(400).json({ error: 'ulbid, financial_year, and month_name are required.' });
        }

        // Step 2: Validate financial year format
        const yearString = String(financial_year);
        if (!yearString.match(/^\d{2}_\d{2}$/)) {
            console.error(`❌ Invalid financial_year format: ${financial_year}`);
            return res.status(400).json({
                error: 'Invalid financial_year format. Expected YY_YY format (e.g., 24_25).'
            });
        }

        // Step 3: Normalize and validate month name
        const uppercasedMonthName = String(month_name).trim().toUpperCase();
        const validMonths = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];
        if (!validMonths.includes(uppercasedMonthName)) {
            console.error(`❌ Invalid month_name: '${month_name}'`);
            return res.status(400).json({ error: `Invalid month_name: '${month_name}'. Must be a full name like 'NOVEMBER'.` });
        }

        console.log("✅ Validated Inputs:", {
            ulbid: parseInt(ulbid, 10),
            year: yearString,
            month: uppercasedMonthName
        });

        connection = await getConnection();
        console.log("✅ Database connection established.");

        const sqlQuery = `
            SELECT   
                COUNT(DISTINCT rcptno) AS RCPTNO, 
                reciptdt, 
                SUM(recamount) AS RECAMOUNT
            FROM (
                SELECT 
                    num_recipt_ulbid AS ulbid, 
                    var_recipt_rcptno AS rcptno, 
                    TRUNC(dat_recipt_insdate) AS reciptdt,
                    num_appli_recamount AS recamount,
                    UPPER(TO_CHAR(dat_recipt_insdate, 'FMMonth', 'NLS_DATE_LANGUAGE=ENGLISH')) AS month_name,
                    CASE 
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2020', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2021', 'DD-MON-YYYY') THEN '20_21'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2021', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2022', 'DD-MON-YYYY') THEN '21_22'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2022', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2023', 'DD-MON-YYYY') THEN '22_23'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2023', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2024', 'DD-MON-YYYY') THEN '23_24'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2024', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2025', 'DD-MON-YYYY') THEN '24_25'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2025', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2026', 'DD-MON-YYYY') THEN '25_26'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2026', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2027', 'DD-MON-YYYY') THEN '26_27'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2027', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2028', 'DD-MON-YYYY') THEN '27_28'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2028', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2029', 'DD-MON-YYYY') THEN '28_29'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2029', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2030', 'DD-MON-YYYY') THEN '29_30'
                        WHEN dat_recipt_insdate BETWEEN TO_DATE('01-APR-2030', 'DD-MON-YYYY') AND TO_DATE('31-MAR-2031', 'DD-MON-YYYY') THEN '30_31'
                        ELSE NULL 
                    END AS year
                FROM aomk_mktlice_mas
                INNER JOIN aomk_appli_mas ON num_appli_id = num_mktlice_appliid
                INNER JOIN aomk_recipt_def ON num_recipt_appliid = num_appli_id
                INNER JOIN prop.vw_ward_mas wm ON wm.wardid = num_appli_wardid
                INNER JOIN aomk_applidirector_det ON num_applidirector_appliid = num_appli_id
                INNER JOIN aomk_applitype_mas ON num_applitype_id = num_applidirector_applitype
            )
            WHERE 
                ulbid = '${parseInt(ulbid, 10)}'
                AND year = '${yearString}'
                AND month_name = '${uppercasedMonthName}'
            GROUP BY reciptdt
            ORDER BY reciptdt
        `;

        console.log("🧾 Final SQL Query:\n", sqlQuery);

        const result = await connection.execute(sqlQuery, {}, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        console.log("📊 Query Result:", result.rows?.length, "records found.");

        res.status(200).json({
            data: result.rows
        });

    } catch (err) {
        console.error('💥 Error in getDailyMarketDashboardDataByMonth:', err);
        res.status(500).json({ error: 'Failed to fetch daily data by month', details: err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("🔌 Database connection closed.");
            } catch (err) {
                console.error('⚠️ Error closing connection:', err);
            }
        }
    }
};

module.exports = getDailyMarketDashboardDataByMonth;
