const express = require('express');
const router = express.Router();
const FrmTradeMst = require('../../../controllers/Market/Masters/FrmTradeMst'); 

router.post('/FrmTradeMst', FrmTradeMst);

module.exports = router;

//http://localhost:5000/FrmTradeMst

// {
//     "trade_id": 241,
//     "org_id": 5
// }