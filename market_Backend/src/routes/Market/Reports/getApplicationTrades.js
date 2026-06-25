const express = require("express");
const getApplicationTrades= require("../../../controllers/Market/Reports/getApplicationTrades");
const router = express.Router();

router.post("/getApplicationTrades", getApplicationTrades);

module.exports = router;

//http://localhost:5000/getApplicationTrades