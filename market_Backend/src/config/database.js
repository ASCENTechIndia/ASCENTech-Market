require("dotenv").config();
const oracledb = require("oracledb");

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
  poolAlias: "default", // <-- Add this line
  queueTimeout: 120000, // Default is 60000 (60 seconds). You can increase it if necessary.
  poolMin: 10, // Consider increasing this as well if you need more always-ready connections
  poolMax: 100, // <--- Increase this significantly if needed (e.g., 50, 100, 200)
  poolIncrement: 1, // Keep this
};

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
  } catch (err) {
    console.error("Oracle DB Connection Error:", err);
    process.exit(1);
  }
}

async function getConnection() {
  return await oracledb.getConnection("default");
}

module.exports = {
  initialize,
  getConnection,
};
