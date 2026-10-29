const express = require('express');
const router = express.Router();
const FrmTradeList = require('../../../controllers/Market/Masters/FrmTradeList'); 

router.post('/FrmTradeList', FrmTradeList);

module.exports = router;

//http://localhost:5000/FrmTradeList

// {
//     "org_id": 5
// }