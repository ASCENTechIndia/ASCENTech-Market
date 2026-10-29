const express = require('express');
const router = express.Router();
const FrmTradeCategoryList = require('../../../controllers/Market/Masters/FrmTradeCategoryList'); 

router.post('/FrmTradeCategoryList', FrmTradeCategoryList);

module.exports = router;

//http://localhost:5000/FrmTradeCategoryList

// {
//     "OrgId": 5
// }