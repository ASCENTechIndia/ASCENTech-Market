const express = require('express');
const router = express.Router();
const getTradeTypeRates = require('../../../controllers/Market/Masters/getTradeTypeRates'); 

router.post('/getTradeTypeRates', getTradeTypeRates);

module.exports = router;

//http://localhost:5000/getTradeTypeRates