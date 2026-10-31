const express = require("express");
const getDirectorDetailsWithApplicationId = require("../../../controllers/Market/Transaction/getDirectorDetailsWithApplicationId");
const router = express.Router();

router.post("/getDirectorDetailsWithApplicationId", getDirectorDetailsWithApplicationId);

module.exports = router;

//http://localhost:5000/getDirectorDetailsWithApplicationId

// {
//   "applicationId": "3681"
// }