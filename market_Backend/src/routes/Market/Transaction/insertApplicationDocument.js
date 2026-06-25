const express = require("express");
const multer = require("multer"); // IMPORTANT: Ensure multer is required here
const insertApplicationDocument = require("../../../controllers/Market/Transaction/insertApplicationDocument"); // Adjust path as needed
const router = express.Router();

// Configure Multer for file uploads
// Use memoryStorage to store the file as a Buffer (ideal for BLOBs)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the POST route for /insertApplicationDocument
// CRITICAL: Apply the `upload.single('blobDocFile')` middleware here.
// 'blobDocFile' MUST match the "Key" name you use for the file field in Postman's form-data.
router.post(
  "/insertApplicationDocument",
  upload.single("blobDocFile"),
  insertApplicationDocument
);

module.exports = router;
