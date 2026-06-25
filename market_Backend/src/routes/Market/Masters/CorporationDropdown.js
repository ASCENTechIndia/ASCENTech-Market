const express = require('express');
const router = express.Router();
const CorporationDropdown = require('../../../controllers/Market/Masters/CorporationDropdown'); 

router.get('/CorporationDropdown', CorporationDropdown);

module.exports = router;

//http://localhost:5000/CorporationDropdown