const express = require('express');
const router = express.Router();
const getWardUserConfig = require('../../../controllers/Market/Masters/getWardUserConfig'); // Adjust path as needed

// POST route for fetching ward user configuration
router.post('/WardUserConfig', getWardUserConfig);

module.exports = router;