const express = require("express");
const getTradeServiceCount = require("../../../controllers/Market/Transaction/getTradeServiceCount");
const router = express.Router();

router.post("/getTradeServiceCount", getTradeServiceCount);

module.exports = router;
