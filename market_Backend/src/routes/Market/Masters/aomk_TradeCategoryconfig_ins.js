const express = require("express");
const aomk_TradeCategoryconfig_ins = require("../../../controllers/Market/Masters/aomk_TradeCategoryconfig_ins");
const router = express.Router();

router.post("/aomk_TradeCategoryconfig_ins", aomk_TradeCategoryconfig_ins);

module.exports = router;