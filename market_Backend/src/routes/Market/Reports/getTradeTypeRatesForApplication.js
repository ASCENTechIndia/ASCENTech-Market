const express = require("express");
const getTradeTypeRatesForApplication= require("../../../controllers/Market/Reports/getTradeTypeRatesForApplication");
const router = express.Router();

router.post("/getTradeTypeRatesForApplication", getTradeTypeRatesForApplication);

module.exports = router;

//http://localhost:5000/getTradeTypeRatesForApplication

// {
//   "ulbId": "5",
//   "appId": "1705"
// }