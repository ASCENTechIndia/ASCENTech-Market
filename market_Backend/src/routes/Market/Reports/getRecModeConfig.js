const express = require("express");
const getRecModeConfig= require("../../../controllers/Market/Reports/getRecModeConfig");
const router = express.Router();

router.post("/getRecModeConfig", getRecModeConfig);

module.exports = router;

//http://localhost:5000/getRecModeConfig