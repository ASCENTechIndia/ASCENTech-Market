const express = require('express');
const router = express.Router();
const {getConfiguredTradeCategories,aomk_TradeCategoryconfig_ins} = require('../../../controllers/Market/Masters/getConfiguredTradeCategories'); 

router.post('/getConfiguredTradeCategories', getConfiguredTradeCategories);

router.post("/aomk_TradeCategoryconfig_ins", aomk_TradeCategoryconfig_ins);

module.exports = router;


