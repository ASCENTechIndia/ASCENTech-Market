const express = require("express");
const getAppliTradeTypeDetails = require("../../../controllers/Market/Transaction/getAppliTradeTypeDetails");
const router = express.Router();

router.post("/getAppliTradeTypeDetails", getAppliTradeTypeDetails);

module.exports = router;

//http://localhost:5000/getAppliTradeTypeDetails

// {
//   "applicationId": "3681",
//   "ulbId": "5"
// }