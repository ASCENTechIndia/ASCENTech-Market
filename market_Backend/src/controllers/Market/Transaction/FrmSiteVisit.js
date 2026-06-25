const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getSiteVisitApplications = async (req, res) => {
  let connection;

  try {
    const { OrgId, Mode } = req.body;

    if (!OrgId) {
      return res.status(400).json({
        success: false,
        message: "OrgId is required.",
      });
    }

    connection = await getConnection();

    let query = `
      SELECT
        zonename AS zonename,
        wardname AS wardname,
        num_appli_id AS applicationid,
        CASE
          WHEN var_appli_source = 'RTS'
          THEN var_appli_rtsapplino
          ELSE var_appli_applino
        END AS applicationno,
        var_appli_applidt AS applicationdate,
        var_appli_shopname AS shopname,
        num_appli_busstartyr AS Businessyear,
        var_appli_panno AS panno,
        num_appli_contactno AS contactno,
        var_appli_email AS email,
        var_appli_address AS address,
        var_appli_flowtype AS flowtype
      FROM aomk_appli_mas
      INNER JOIN prop.vw_zonemas
        ON zoneid = num_appli_zoneid
       AND wardid = num_appli_wardid
      WHERE 1 = 1
    `;

    const binds = {
      OrgId: Number(OrgId),
    };

    // Keep conditions exactly as in old code
    if (OrgId == "870" || OrgId == "1690") {
      query += `
        AND var_appli_appstatus = 'ADV'
        AND num_appli_ulbid = :OrgId
        AND var_appli_flowtype IN ('S','C')
        ORDER BY num_appli_id DESC
      `;
    }
    else if ((OrgId == "1070" || OrgId == "1850") && Mode == "1") {
      query += `
        AND var_appli_appstatus = 'V'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    }
    else if ((OrgId == "1070" || OrgId == "1850") && Mode == "2") {
      query += `
        AND var_appli_appstatus = 'SV'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    }
    else if (OrgId == "1070" || OrgId == "1850") {
      query += `
        AND var_appli_appstatus = 'VA'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    }
    else {
      query += `
        AND var_appli_appstatus = 'V'
        AND num_appli_ulbid = :OrgId
        ORDER BY num_appli_id DESC
      `;
    }

    const result = await connection.execute(query, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    console.log("result", result.rows);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching site visit applications:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing connection:", err);
      }
    }
  }
};

module.exports = {
  getSiteVisitApplications,
};