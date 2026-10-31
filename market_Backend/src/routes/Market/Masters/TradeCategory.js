const express = require('express');
const router = express.Router();
const TradeCategory = require('../../../controllers/Market/Masters/TradeCategory'); 

router.post('/TradeCategory', TradeCategory);

module.exports = router;

//http://localhost:5000/TradeCategory

// {
//     "org_id": 5
// }