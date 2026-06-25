const express = require("express");
const getDigiCertDetails= require("../../../controllers/Market/Reports/getDigiCertDetails");
const router = express.Router();

router.post("/getDigiCertDetails", getDigiCertDetails);

module.exports = router;

//http://localhost:5000/getDigiCertDetails

// {
//   "AppliNo": "MK1361",
//   "OrgId": "5"
// }