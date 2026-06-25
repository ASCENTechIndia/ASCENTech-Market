const express = require("express");
const getDirectorDetailsWithAppliTypeUlb= require("../../../controllers/Market/Reports/getDirectorDetailsWithAppliTypeUlb");
const router = express.Router();

router.post("/getDirectorDetailsWithAppliTypeUlb", getDirectorDetailsWithAppliTypeUlb);

module.exports = router;

//http://localhost:5000/getDirectorDetailsWithAppliTypeUlb

// {
//   "appId": "1705",
//   "ulbId": "5"
// }