const express = require("express");
const Aomk_TradeType_Ins = require("../../../controllers/Market/Masters/Aomk_TradeType_Ins");
const router = express.Router();

router.post("/Aomk_TradeType_Ins", Aomk_TradeType_Ins);

module.exports = router;