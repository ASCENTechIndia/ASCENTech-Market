// src/routes/imageRoutes.js

const express = require("express");
const {
  getImagesByAppliId,
  serveImageBlob,
} = require("../../../controllers/Market/Reports/GetImageforreports");

const router = express.Router();

router.post("/getImages", getImagesByAppliId);

router.get("/image/:appliId/:docId", serveImageBlob);

module.exports = router;
