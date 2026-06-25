const oracledb = require("oracledb");
const { getConnection } = require("../../../src/config/database");

const getMenus = async (req, res) => {
  let connection;

  try {
    // Extract data from req.body instead of req.query
    const { userId, ulbId, deptId } = req.body;

    console.log(
      "Received Request Body Params - User:",
      userId,
      "ULB:",
      ulbId,
      "Dept:",
      deptId
    );

    // Check if all required request body parameters are present
    if (!userId || !ulbId || !deptId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing required request body parameters",
        });
    }

    connection = await getConnection();

    const query = `
      SELECT 
        num_menumaster_menuid AS menuid, 
        var_menumaster_pagetitle AS menutitle,
        num_menumaster_parentmenuid AS parentid,
        var_menumaster_pagepath AS pagepath,       
        num_menumaster_orderby AS orderby 
      FROM admins.aoma_menumaster_mas 
      WHERE 
        num_menumaster_parentmenuid = 0     
        AND num_menumaster_deptid = :deptId
 AND var_menumaster_pagetitle <> 'Logout' -- Exclude Logout
      UNION

      SELECT 
        num_menumaster_menuid AS menuid, 
        var_menumaster_pagetitle AS menutitle,
        num_menumaster_parentmenuid AS parentid,
        var_menumaster_pagepath AS pagepath,       
        num_menumaster_orderby AS orderby   
      FROM admins.aoma_menumaster_mas     
      INNER JOIN admins.aoma_MenuULB_Config 
        ON num_menucorporation_menuid = num_menumaster_menuid     
      INNER JOIN admins.aoma_MenuUser_Config 
        ON num_menuuser_menuid = num_menumaster_menuid    
      WHERE 
        var_menuuser_activeflag = 'Y'   
        AND var_menuuser_userid = :userId     
        AND var_menumaster_pagepath IS NOT NULL     
        AND num_menumaster_deptid = :deptId   
        AND num_menucorporation_ulbid = :ulbId 
         AND var_menumaster_pagetitle <> 'Logout' -- Exclude Logout
      ORDER BY orderby
    `;

    const binds = {
      userId,
      ulbId: parseInt(ulbId),
      deptId: parseInt(deptId),
    };

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching menu data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching menu data" });
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

const getApplichart = async (req, res) => {
  let connection;

  try {
    const { ulbId } = req.body;

    // Validate required parameter
    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: ulbId",
      });
    }

    connection = await getConnection();

    const query = `
      SELECT * 
      FROM vw_applichart
      WHERE ulbid = :ulbId
    `;

    const binds = { ulbId: parseInt(ulbId) };

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching vw_applichart data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vw_applichart data",
    });
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

const getRegMonthwiseData = async (req, res) => {
  let connection;

  try {
    const { ulbId } = req.body;

    // Validate required parameter
    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: ulbId",
      });
    }

    connection = await getConnection();

    const query = `
      SELECT * 
      FROM vw_regyearwisedata
      WHERE ulbid = :ulbId
    `;

    const binds = { ulbId: parseInt(ulbId) };

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching vw_regmonthwisedata data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vw_regmonthwisedata data",
    });
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

const getTradTypeCerti = async (req, res) => {
  let connection;

  try {
    const { ulbId } = req.body;

    // Validate required parameter
    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: ulbId",
      });
    }

    connection = await getConnection();

    const query = `
      SELECT * 
      FROM view_tradtypecerti
      WHERE ulbid = :ulbId
    `;

    const binds = { ulbId: parseInt(ulbId) };

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching view_tradtypecerti data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching view_tradtypecerti data",
    });
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

const getAppliAgingReport = async (req, res) => {
  let connection;

  try {
    const { ulbId } = req.body;

    // If ulbId is required, validate it
    if (!ulbId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: ulbId",
      });
    }

    connection = await getConnection();

    const query = `
      SELECT * 
      FROM vw_appliagingreport
      WHERE ulbid = :ulbId
    `;

    const binds = { ulbId: parseInt(ulbId) };

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching vw_appliagingreport data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching vw_appliagingreport data",
    });
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


const getApplicationRevenue = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const query = `
      SELECT *
      FROM estate.view_application_revenue
    `;

    const result = await connection.execute(query, {}, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching view_application_revenue data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching view_application_revenue data",
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing Oracle connection:", err); }
    }
  }
};

const getApplicationStatus = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const query = `
      SELECT *
      FROM estate.VIEW_APPLICATIONSTATUS
    `;

    const result = await connection.execute(query, {}, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching VIEW_APPLICATIONSTATUS data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching VIEW_APPLICATIONSTATUS data",
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing Oracle connection:", err); }
    }
  }
};

const getApplicationStatusTrend = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const query = `
      SELECT *
      FROM estate.VIEW_APPLICATIONSTATUS_TREND
    `;

    const result = await connection.execute(query, {}, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching VIEW_APPLICATIONSTATUS_TREND data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching VIEW_APPLICATIONSTATUS_TREND data",
    });
  } finally {
    if (connection) {
      try { await connection.close(); } catch (err) { console.error("Error closing Oracle connection:", err); }
    }
  }
};

// ------------------- Exports -------------------
module.exports = {
  getMenus,
  getApplichart,
  getRegMonthwiseData,
  getTradTypeCerti,
  getAppliAgingReport,
  getApplicationRevenue,       // <-- added
  getApplicationStatus,        // <-- added
  getApplicationStatusTrend    // <-- added
};
