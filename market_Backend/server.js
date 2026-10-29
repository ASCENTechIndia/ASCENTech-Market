
const express = require("express");
const cors = require("cors");
const db = require("./src/config/database.js");
const routes = require("./src/routes/index.js");
const session = require("express-session");
const path = require("path");
const proxyRouter = require("./src/routes/proxy");
const cookieParser = require("cookie-parser");

const app = express();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "your_secret_key";
app.use(cookieParser());
// Disable caching
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Parse cookies


// CORS
app.use(
  cors({
    origin: [
      /\.nagarkaryavalinewuat\.com$/,
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Parse request bodies
app.use(express.json());

// Session middleware
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: IS_PROD,
      sameSite: "Strict",
      domain: IS_PROD
        ? ".nagarkaryavalinewuat.com"
        : undefined,
      maxAge: 60 * 60 * 1000,
    },
  })
);

// API routes — register only once
app.use("/", routes);

// Proxy routes
app.use("/proxy", proxyRouter);

// Static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.use(
  "/images",
  express.static(
    path.join(__dirname, "src", "generated_images")
  )
);

app.use(
  "/generated_files",
  express.static(
    path.join(__dirname, "src", "generated_files")
  )
);

// Optional: log unmatched API requests
app.use((req, res) => {
  console.error(`Route not found: ${req.method} ${req.originalUrl}`);

  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Initialize DB and start server
db.initialize()
  .then(() => {
    console.log("Oracle DB Connection Pool Initialized");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database Initialization Failed:", err);
    process.exit(1);
  });
