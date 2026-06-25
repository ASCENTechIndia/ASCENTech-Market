const express = require('express');
const router = express.Router();
const {FrmTradeTypeList, getTradeTypeRates, BindTradeTypeDetails, TradeCategory } = require('../../../controllers/Market/Masters/FrmTradeTypeList'); 

router.post('/FrmTradeTypeList', FrmTradeTypeList);
router.post('/getTradeTypeRates', getTradeTypeRates);
router.post("/BindTradeTypeDetails", BindTradeTypeDetails);
router.post('/TradeCategory', TradeCategory);

module.exports = router;

