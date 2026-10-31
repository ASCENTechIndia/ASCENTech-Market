const express = require("express");
const Aomk_TradeCategory_Ins = require("../../../controllers/Market/Masters/Aomk_TradeCategory_Ins");
const router = express.Router();

router.post("/Aomk_TradeCategory_Ins", Aomk_TradeCategory_Ins);

module.exports = router;