const express = require("express");
const getDistinctZones = require("../../../controllers/Market/Transaction/getDistinctZones");
const router = express.Router();

router.post("/getDistinctZones", getDistinctZones);

module.exports = router;

//http://localhost:5000/getDistinctZones