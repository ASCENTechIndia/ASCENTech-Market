const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getApplicationDetails = async (req, res) => {
  let connection;

  try {
    const { AppliList_AppId, OrgId } = req.body;

    if (!AppliList_AppId || !OrgId) {
      return res
        .status(400)
        .json({ error: "Missing AppliList_AppId or OrgId" });
    }

    const query = `
      SELECT var_appli_applino, var_appli_applidt, var_appli_oldlicencno, var_appli_shopname, var_appli_panno,
        num_appli_contactno, var_appli_email, var_appli_address, num_appli_zoneid, num_appli_wardid, var_appli_isprod,
        var_appli_ownspace, var_appli_agrmentwith, num_appli_area, var_appli_iscorpnoc, num_appli_busstartyr,
        var_appli_shopactno, var_appli_foodlicno, num_appli_licdays, var_appli_shopnamemar, 
        var_appli_placeownername, var_appli_placeowneraddress, dat_appli_fromdt, dat_appli_todt,
        NVL(num_appli_amount, 0) AS amount, NVL(num_appli_arreasamt, 0) AS arreasamt
      FROM aomk_appli_mas
      WHERE num_appli_id = :appId AND num_appli_UlbId = :orgId
    `;

    connection = await getConnection();

    const result = await connection.execute(
      query,
      {
        appId: AppliList_AppId,
        orgId: OrgId,
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No application found" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching application details:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing the database connection:", closeError);
      }
    }
  }
};

module.exports = {
  getApplicationDetails,
};
