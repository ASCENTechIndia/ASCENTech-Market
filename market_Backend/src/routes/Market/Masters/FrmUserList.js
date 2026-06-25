const express = require('express');
const router = express.Router();
const FrmUserList = require('../../../controllers/Market/Masters/FrmUserList'); 

router.post('/FrmUserList', FrmUserList);

module.exports = router;

