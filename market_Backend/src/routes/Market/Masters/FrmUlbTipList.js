const express = require('express');
const router = express.Router();
const FrmUlbTipList = require('../../../controllers/Market/Masters/FrmUlbTipList'); 

router.post('/FrmUlbTipList', FrmUlbTipList);

module.exports = router;

//http://localhost:5000/FrmUlbTipList

// {
//     "UlbId": 5
// }