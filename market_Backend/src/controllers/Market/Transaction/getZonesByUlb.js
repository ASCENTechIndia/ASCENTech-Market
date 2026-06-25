const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const getZonesByUlb = async (req, res) => {
  let connection;
  try {
    const { ulbid } = req.body;

    if (!ulbid) {
      return res.status(400).json({ error: "Missing ulbid" });
    }

    const query = `
      SELECT zonename, zoneid
      FROM prop.vw_zonemas
      WHERE ulbid = :ulbid
    `;

    connection = await getConnection();
    const result = await connection.execute(
      query,
      { ulbid },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching zones:", error);
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

module.exports = { getZonesByUlb };
