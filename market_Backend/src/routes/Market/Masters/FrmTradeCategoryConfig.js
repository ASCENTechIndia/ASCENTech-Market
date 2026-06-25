const express = require('express');
const router = express.Router();
const FrmTradeCategoryConfig = require('../../../controllers/Market/Masters/FrmTradeCategoryConfig'); 

router.post('/FrmTradeCategoryConfig', FrmTradeCategoryConfig);

module.exports = router;


