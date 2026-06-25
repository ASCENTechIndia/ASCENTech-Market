const express = require("express");
const cors = require("cors");
const db = require("./src/config/database.js");
const routes = require("./src/routes/index.js");
const session = require("express-session");
const path = require("path");
const app = express();
const proxyRouter = require("./src/routes/proxy");

// Middleware
app.use(cors());
app.use(express.json());


app.use("/", routes);
app.use("/proxy", proxyRouter);


// Session middleware (should be before routes that use sessions)
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Serve static files from the 'uploads' directory
// This makes files in 'your_project_root/uploads/' accessible via '/uploads' URL path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/images",
  express.static(path.join(__dirname, "src", "generated_images"))
);
app.use(
  "/generated_files",
  express.static(path.join(__dirname, "src", "generated_files"))
);
app.use("/", routes);

// Initialize DB Connection
db.initialize()
  .then(() => {
    console.log("Oracle DB Connection Pool Initialized");

    // Start the server after DB initialization
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database Initialization Failed:", err);
    process.exit(1); // Exit if DB fails to initialize
  });
