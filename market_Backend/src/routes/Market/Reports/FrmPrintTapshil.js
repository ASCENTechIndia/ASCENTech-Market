const express = require("express");
const FrmPrintTapshil= require("../../../controllers/Market/Reports/FrmPrintTapshil");
const router = express.Router();

router.post("/FrmPrintTapshil", FrmPrintTapshil);

module.exports = router;

//http://localhost:5000/FrmPrintTapshil

// {
//   "FromDt": "01-05-2024",
//   "ToDt": "10-06-2024",
//   "OrgId": "5",
//   "ZoneId": "-1",
//   "TradeCategoryId": "-1",
//   "TradeTypeId": "-1"
// }