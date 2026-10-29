const express = require("express");
const getTradeTypesByCategory= require("../../../controllers/Market/Reports/getTradeTypesByCategory");
const router = express.Router();

router.post("/getTradeTypesByCategory", getTradeTypesByCategory);

module.exports = router;

//http://localhost:5000/getTradeTypesByCategory