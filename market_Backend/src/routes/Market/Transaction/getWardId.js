const express = require("express");
const getWardId = require("../../../controllers/Market/Transaction/getWardId");
const router = express.Router();

router.post("/getWardId", getWardId);

module.exports = router;

//http://localhost:5000/getWardId

// {
//   "ulbId": "5",
//   "zoneId": "2101"
// }