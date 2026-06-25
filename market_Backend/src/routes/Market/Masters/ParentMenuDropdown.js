const express = require('express');
const router = express.Router();
const ParentMenuDropdown = require('../../../controllers/Market/Masters/ParentMenuDropdown'); 

router.post('/ParentMenuDropdown', ParentMenuDropdown);

module.exports = router;

