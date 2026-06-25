const express = require("express");
const getDirectorDetailsByAppliId = require("../../../controllers/Market/Transaction/getDirectorDetailsByAppliId");
const router = express.Router();

router.post("/getDirectorDetailsByAppliId", getDirectorDetailsByAppliId);

module.exports = router;

//http://localhost:5000/getDirectorDetailsByAppliId

// {
//   "applicationId": "22"
// }