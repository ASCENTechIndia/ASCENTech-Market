const express = require('express');
const router = express.Router();
const MenuDesignationId = require('../../../controllers/Market/Masters/MenuDesignationId');

router.post('/MenuDesignationId', MenuDesignationId);

module.exports = router;

