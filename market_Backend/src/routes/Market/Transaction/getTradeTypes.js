const express = require("express");
const getTradeTypes = require("../../../controllers/Market/Transaction/getTradeTypes");
const router = express.Router();

router.post("/getTradeTypes", getTradeTypes);

module.exports = router;

//http://localhost:5000/getTradeTypes

// {
//   "ulbId": "5"
// }