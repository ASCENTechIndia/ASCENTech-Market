const express = require('express');
const router = express.Router();
const MenuCorporationList = require('../../../controllers/Market/Masters/MenuCorporationList'); 

router.post('/MenuCorporationList', MenuCorporationList);

module.exports = router;
