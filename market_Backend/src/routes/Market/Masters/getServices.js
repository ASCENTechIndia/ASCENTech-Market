const express = require('express');
const router = express.Router();
const getServices = require('../../../controllers/Market/Masters/getServices'); 

router.get('/getServices', getServices);

module.exports = router;

//http://localhost:5000/getServices