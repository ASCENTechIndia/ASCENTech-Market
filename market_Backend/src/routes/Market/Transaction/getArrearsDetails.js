const express = require("express");
const getArrearsDetails = require("../../../controllers/Market/Transaction/getArrearsDetails");
const router = express.Router();

router.post("/getArrearsDetails", getArrearsDetails);

module.exports = router;

//http://localhost:5000/getArrearsDetails

// {
//   "marketLicenseId": "1176",
//   "ulbId": "5"
// }