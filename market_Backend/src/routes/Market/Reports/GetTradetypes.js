const express = require("express");
const router = express.Router();
const getApplicantTradeTypes = require("../../../controllers/Market/Reports/GetTradetypes"); // Adjust path as needed

// Example POST endpoint for fetching applicant trade types
router.post("/applicant-trade-types", getApplicantTradeTypes);

module.exports = router;
