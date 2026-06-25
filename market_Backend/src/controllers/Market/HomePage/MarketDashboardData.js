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


const getMenus = async (req, res) => {
  let connection;
  try {
    const { userId, ulbId, deptId } = req.query;

    console.log("Received Query Params - User:", userId, "ULB:", ulbId, "Dept:", deptId);

    if (!userId || !ulbId || !deptId) {
      return res.status(400).json({ success: false, message: "Missing required query parameters" });
    }

    connection = await getConnection();

    const query = `
      select num_menumaster_menuid menuid,
       var_menumaster_pagetitle menutitle,
       num_menumaster_parentmenuid parentid,
       var_menumaster_pagepath pagepath,
       num_menumaster_orderby orderby
  from admins.aoma_menumaster_mas
 where num_menumaster_parentmenuid = 0
   and num_menumaster_deptid = :deptId
union
select num_menumaster_menuid menuid,
       var_menumaster_pagetitle menutitle,
       num_menumaster_parentmenuid parentid,
       var_menumaster_pagepath pagepath,
       num_menumaster_orderby orderby
  from admins.aoma_menumaster_mas
       inner join admins.aoma_MenuULB_Config
               on num_menucorporation_menuid = num_menumaster_menuid
       inner join admins.aoma_MenuUser_Config
               on num_menuuser_menuid = num_menumaster_menuid
 where var_menuuser_activeflag = 'Y'
   and var_menuuser_userid = :userId
   and var_menumaster_pagepath is not null
   and num_menumaster_deptid = :deptId
   and num_menucorporation_ulbid = :ulbId
order by orderby

    `;

    const binds = { userId, ulbId, deptId };
    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching menu data:", error);
    res.status(500).json({ success: false, message: "Error fetching menu data" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle connection:", err);
      }
    }
  }
};
function getDateFilter(mode, fromDate, toDate, searchText) {
  switch (mode) {
    case "1": return "AND TRUNC(appdate) = TRUNC(SYSDATE)";
    case "2": return "AND TRUNC(appdate, 'IW') = TRUNC(SYSDATE, 'IW')";
    case "3": return "AND TRUNC(appdate, 'MM') = TRUNC(SYSDATE, 'MM')";
    case "4": return "AND TRUNC(appdate, 'YYYY') = TRUNC(SYSDATE, 'YYYY')";
    case "5":
      let where = `AND TRUNC(appdate) >= TO_DATE('${fromDate}','DD/MM/YYYY') 
                   AND TRUNC(appdate) <= TO_DATE('${toDate}','DD/MM/YYYY')`;
      if (searchText) {
        where += ` AND (appno = '${searchText}' OR appname = '${searchText}')`;
      }
      return where;
    case "6": // 🔥 NEW: All data (no date filter)
      return "";
    default:
      return "";
  }
}


// 1️⃣ BindDtls
const getApplicationDetails = async (req, res) => {
  let connection;
  try {
    const { mode, fromDate, toDate, searchText, ulbid } = req.query;
    connection = await getConnection();

    const filter = getDateFilter(mode, fromDate, toDate, searchText);

    const query = `
      SELECT appno, appname, type, status, zonename, appdate
      FROM vw_applidtls
      WHERE ulbid = :ulbid ${filter}
    `;

    const result = await connection.execute(query, { ulbid }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getApplicationDetails:", err);
    res.status(500).json({ success: false, message: "Error fetching details" });
  } finally {
    if (connection) await connection.close();
  }
};

// 2️⃣ BindData
const getDashboardCounts = async (req, res) => {
  let connection;
  try {
    const { mode, fromDate, toDate, searchText, ulbid } = req.query;
    connection = await getConnection();

    const filter = getDateFilter(mode, fromDate, toDate, searchText);

    const query = `
      SELECT NVL(SUM(new),0) new,
             NVL(SUM(renewal),0) renewal,
             NVL(SUM(verifypending),0) verifypending,
             NVL(SUM(authpending),0) authpending,
             NVL(SUM(paymentpending),0) paymentpending,
             NVL(SUM(reject),0) reject,
             NVL(SUM(visitpending),0) visitpending,
             NVL(SUM(newissued),0) newissued,
             NVL(SUM(renewissued),0) renewissued
      FROM vw_dashboard
      WHERE ulbid = :ulbid ${filter}
    `;

    const result = await connection.execute(query, { ulbid }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("Error in getDashboardCounts:", err);
    res.status(500).json({ success: false, message: "Error fetching counts" });
  } finally {
    if (connection) await connection.close();
  }
};

// 3️⃣ BindPieChart
const getPieChartData = async (req, res) => {
  let connection;
  try {
    const { mode, fromDate, toDate, searchText, ulbid } = req.query;
    connection = await getConnection();

    const filter = getDateFilter(mode, fromDate, toDate, searchText);

    const query = `
      SELECT description, NVL(SUM(total),0) total
      FROM vw_chartdat
      WHERE ulbid = :ulbid ${filter}
      GROUP BY description
    `;

    const result = await connection.execute(query, { ulbid }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getPieChartData:", err);
    res.status(500).json({ success: false, message: "Error fetching chart data" });
  } finally {
    if (connection) await connection.close();
  }
};

// 4️⃣ BindDatabyMonth
const getApplicationsByMonth = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();

    // get ulbid from query params (example: /applications/monthly?ulbid=101)
    const { ulbid } = req.query;

    const query = `
      SELECT 
          TO_CHAR(appdate, 'Mon') AS month,
          COUNT(CASE WHEN TYPE = 'New' THEN 1 END) AS new_applications,
          COUNT(CASE WHEN TYPE = 'Renewal' THEN 1 END) AS renewal_applications
      FROM vw_applidtls
      WHERE ulbid = :ulbid
      GROUP BY TO_CHAR(appdate, 'Mon'), TO_CHAR(appdate, 'MM')
      ORDER BY TO_CHAR(appdate, 'MM')
    `;

    const result = await connection.execute(
      query,
      { ulbid }, // ✅ bind parameter
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("Error in getApplicationsByMonth:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching month-wise data" 
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};


const getAgingApplications = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();
    const { ulbid } = req.query;

    const query = `
      SELECT 
          a.appno,
          a.type,
          a.status,
          a.appdate,
          TRUNC(SYSDATE - a.appdate) AS days_pending,
          CASE 
              WHEN TRUNC(SYSDATE - a.appdate) <= 7 THEN '0-7 days'
              WHEN TRUNC(SYSDATE - a.appdate) BETWEEN 8 AND 15 THEN '8-15 days'
              WHEN TRUNC(SYSDATE - a.appdate) BETWEEN 16 AND 30 THEN '16-30 days'
              ELSE '30+ days'
          END AS aging_bucket
      FROM vw_applidtls a
      WHERE a.status = 'Payment Pending'
        AND a.ulbid = :ulbid
      ORDER BY days_pending DESC
    `;

    const result = await connection.execute(
      query,
      { ulbid }, // ✅ bind parameter
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error("Error in getAgingApplications:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching aging applications"
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};


const getRejectedApplications = async (req, res) => {
  let connection;

  try {
    connection = await getConnection();
    const { ulbid } = req.query;

    const query = `
      SELECT 
          a.appno,
          a.type,
          a.status,
          a.appdate,
          TRUNC(SYSDATE - a.appdate) AS days_pending,
          CASE 
              WHEN TRUNC(SYSDATE - a.appdate) <= 7 THEN '0-7 days'
              WHEN TRUNC(SYSDATE - a.appdate) BETWEEN 8 AND 15 THEN '8-15 days'
              WHEN TRUNC(SYSDATE - a.appdate) BETWEEN 16 AND 30 THEN '16-30 days'
              ELSE '30+ days'
          END AS aging_bucket
      FROM vw_applidtls a
      WHERE a.status = 'Rejected'
        AND a.ulbid = :ulbid
      ORDER BY days_pending DESC
    `;

    const result = await connection.execute(
      query,
      { ulbid }, // ✅ bind parameter
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    console.error("Error in getRejectedApplications:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching rejected applications"
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("Error closing connection:", closeErr);
      }
    }
  }
};


module.exports = { MarketDashboardData, getMenus,
  getApplicationDetails,
  getDashboardCounts,
  getPieChartData,
  getApplicationsByMonth,
  getAgingApplications,
  getRejectedApplications }