const express = require("express");
const {
  fetchCorporationDetails,
} = require("../../controllers/Admin/logocontroller.js");

const router = express.Router();

// Define route: GET /api/corporation/details/:ulbId
router.get("/textlogo/:ulbId", fetchCorporationDetails);

module.exports = router;
