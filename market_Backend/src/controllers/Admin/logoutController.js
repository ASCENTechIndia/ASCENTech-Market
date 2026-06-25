const oracledb = require("oracledb");
const { getConnection } = require("../../config/database.js");

const logoutUser = async (req, res) => {
  const { in_UserId, in_ipaddr } = req.body;

  if (!in_UserId || !in_ipaddr) {
    return res.status(400).json({ error: "userId and ipAddress are required" });
  }

  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `BEGIN admins.aoma_logout_fetch(:in_UserId, :in_ipaddr, :in_source, :out_ErrorCode, :Out_ErrorMsg); END;`,
      {
        in_UserId: in_UserId,
        in_ipaddr: in_ipaddr,
        in_source: "WEB",
        out_ErrorCode: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        Out_ErrorMsg: {
          dir: oracledb.BIND_OUT,
          type: oracledb.STRING,
          maxSize: 5000,
        },
      }
    );

    const errorCode = result.outBinds.out_ErrorCode || 0;
    const errorMessage = result.outBinds.Out_ErrorMsg || "Success";

    res.status(200).json({ errorCode, errorMessage });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = { logoutUser };
