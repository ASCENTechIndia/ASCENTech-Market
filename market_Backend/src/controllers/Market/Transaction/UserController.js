const oracledb = require("oracledb");
const { getConnection } = require("../../../config/database");

const GetUserlist = async (req, res) => {
  let connection;
  try {
    const { orgId } = req.body; // Assuming orgId is passed in the request body

    if (!orgId) {
      return res.status(400).json({ success: false, message: "orgId is required" });
    }

    connection = await getConnection();

   
    const sqlQuery = `
      SELECT DISTINCT var_user_username, num_user_userid 
      FROM aomk_warduser_config 
      INNER JOIN admins.aoma_user_def 
      ON num_user_userid = num_warduser_userid 
      AND num_user_ulbid = num_warduser_ulbid
      WHERE num_warduser_ulbid = :orgId
      GROUP BY var_user_username, num_user_userid
    `;

    const result = await connection.execute(
      sqlQuery,
      [orgId], // Bind variables array
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching user list:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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

const GetUserDropdownList = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const sqlQuery = `
      SELECT 
          num_user_userid AS value, 
          var_user_username AS text
      FROM admins.aoma_user_def
      ORDER BY var_user_username
    `;

    const result = await connection.execute(sqlQuery, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    res.status(200).json({
      success: true,
      message: "User dropdown list fetched successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching user dropdown list:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
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
  GetUserlist,
  GetUserDropdownList,
};