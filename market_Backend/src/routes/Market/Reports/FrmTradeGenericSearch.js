const express = require("express");
const FrmTradeGenericSearch= require("../../../controllers/Market/Reports/FrmTradeGenericSearch");
const router = express.Router();

router.post("/FrmTradeGenericSearch", FrmTradeGenericSearch);

module.exports = router;

//http://localhost:5000/FrmTradeGenericSearch