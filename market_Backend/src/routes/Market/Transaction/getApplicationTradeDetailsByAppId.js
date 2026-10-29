const express = require("express");
const getApplicationTradeDetailsByAppId = require("../../../controllers/Market/Transaction/getApplicationTradeDetailsByAppId");
const router = express.Router();

router.post("/getApplicationTradeDetailsByAppId", getApplicationTradeDetailsByAppId);

module.exports = router;

//http://localhost:5000/getApplicationTradeDetailsByAppId