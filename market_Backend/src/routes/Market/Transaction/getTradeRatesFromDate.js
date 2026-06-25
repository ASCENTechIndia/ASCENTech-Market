const express = require("express");
const getTradeRatesFromDate = require("../../../controllers/Market/Transaction/getTradeRatesFromDate");
const router = express.Router();

router.post("/getTradeRatesFromDate", getTradeRatesFromDate);

module.exports = router;

//http://localhost:5000/getTradeRatesFromDate

// {
//   "tradeTypes": "144",
//   "fromDate": "01-01-2022",
//   "ulbId": "5"
// }