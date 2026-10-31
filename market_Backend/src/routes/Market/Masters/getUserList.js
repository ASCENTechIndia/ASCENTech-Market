const express = require('express');
const router = express.Router();
const getUserList = require('../../../controllers/Market/Masters/getUserList'); 

router.post('/getUserList', getUserList);

module.exports = router;