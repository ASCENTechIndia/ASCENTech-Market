const express = require("express");
const getTradeTypesWithFlag = require("../../../controllers/Market/Transaction/getTradeTypesWithFlag");
const router = express.Router();

router.post("/getTradeTypesWithFlag", getTradeTypesWithFlag);

module.exports = router;

//http://localhost:5000/getTradeTypesWithFlag