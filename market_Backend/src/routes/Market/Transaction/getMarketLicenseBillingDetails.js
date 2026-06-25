const express = require("express");
const getMarketLicenseBillingDetails = require("../../../controllers/Market/Transaction/getMarketLicenseBillingDetails");
const router = express.Router();

router.post("/getMarketLicenseBillingDetails", getMarketLicenseBillingDetails);

module.exports = router;

//http://localhost:5000/getMarketLicenseBillingDetails