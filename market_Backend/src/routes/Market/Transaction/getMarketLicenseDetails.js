const express = require("express");
const getMarketLicenseDetails = require("../../../controllers/Market/Transaction/getMarketLicenseDetails");
const router = express.Router();

router.post("/getMarketLicenseDetails", getMarketLicenseDetails);

module.exports = router;

