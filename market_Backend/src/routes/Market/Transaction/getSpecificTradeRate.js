const express = require("express");
const getSpecificTradeRate = require("../../../controllers/Market/Transaction/getSpecificTradeRate");
const router = express.Router();

router.post("/getSpecificTradeRate", getSpecificTradeRate);

module.exports = router;

//http://localhost:5000/getSpecificTradeRate

// {
//   "ulbId": "5",
//   "tradeTypeId": "382",
//   "tradeCategoryId": "21"
// }