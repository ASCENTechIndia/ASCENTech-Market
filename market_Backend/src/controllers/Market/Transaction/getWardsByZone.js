const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getWardsByZone = async (req, res) => {
  let connection;
  try {
    const { zoneid, ulbid } = req.body;

    if (!zoneid || !ulbid) {
      return res.status(400).json({ error: "Missing zoneid or ulbid" });
    }

    const query = `
      SELECT wardname, wardid
      FROM prop.vw_zonemas
      WHERE zoneid = :zoneid AND ulbid = :ulbid
    `;

    connection = await getConnection();
    const result = await connection.execute(
      query,
      { zoneid, ulbid },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching wards:", error);
    res.status(500).json({ error: "Internal server error" });
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

module.exports = { getWardsByZone };
