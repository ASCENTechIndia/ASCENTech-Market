const express = require('express');
const router = express.Router();
const getUsersByCorporationId = require('../../../controllers/Market/Masters/getUsersByCorporationId'); 

router.post('/getUsersByCorporationId', getUsersByCorporationId);

module.exports = router;

