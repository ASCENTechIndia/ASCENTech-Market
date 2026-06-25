const oracledb = require("oracledb");
const { getConnection } = require("../../config/database");

const fetchCorporationDetails = async (req, res) => {
  let connection;

  try {
    const { ulbId } = req.params;
    connection = await getConnection();

    const query = `SELECT var_corporation_name AS corporationName, blob_corporation_img AS corporationLogo 
                   FROM admins.aoma_corporation_mas 
                   WHERE num_corporation_id = :ulbId`;

    const result = await connection.execute(
      query,
      { ulbId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Corporation data not found" });
    }

    const { CORPORATIONNAME, CORPORATIONLOGO } = result.rows[0];

    let logoBase64 = null;

    if (CORPORATIONLOGO) {
      // ✅ Properly handling BLOB
      const blobData = await CORPORATIONLOGO.getData();
      logoBase64 = `data:image/png;base64,${Buffer.from(blobData).toString(
        "base64"
      )}`;
    }

    res.json({
      success: true,
      data: {
        ULBLOGO: logoBase64,
        ABC_MUNICIPAL_TEXT: CORPORATIONNAME, // Assuming this is the correct text
      },
    });
  } catch (error) {
    console.error("Error fetching corporation details:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Error closing Oracle DB connection:", err);
      }
    }
  }
};

module.exports = { fetchCorporationDetails };
