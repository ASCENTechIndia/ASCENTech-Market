const express = require("express");
const getMarketLicenseDetailsByLicenseNo= require("../../../controllers/Market/Reports/getMarketLicenseDetailsByLicenseNo");
const router = express.Router();

router.post("/getMarketLicenseDetailsByLicenseNo", getMarketLicenseDetailsByLicenseNo);

module.exports = router;

//http://localhost:5000/getMarketLicenseDetailsByLicenseNo

// {
//   "LicNo": "1638590080607262022",
//   "OrgId": "5"
// }