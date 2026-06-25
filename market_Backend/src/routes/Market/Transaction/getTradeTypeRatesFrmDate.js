const express = require("express");
const getTradeTypeRatesFrmDate = require("../../../controllers/Market/Transaction/getTradeTypeRatesFrmDate");
const router = express.Router();

router.post("/getTradeTypeRatesFrmDate", getTradeTypeRatesFrmDate);

module.exports = router;

//http://localhost:5000/getTradeTypeRatesFrmDate

// {
//   "tradeTypes": "144",
//   "fromDate": "01-04-2022",
//   "ulbId": "5"
// }