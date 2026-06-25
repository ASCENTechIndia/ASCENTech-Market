const express = require("express");
const getTradeTypeRatesByCategory = require("../../../controllers/Market/Transaction/getTradeTypeRatesByCategory");
const router = express.Router();

router.post("/getTradeTypeRatesByCategory", getTradeTypeRatesByCategory);

module.exports = router;

//http://localhost:5000/getTradeTypeRatesByCategory