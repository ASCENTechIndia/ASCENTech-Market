const express = require("express");
const {FrmPrintMarketReports, FrmPrintSankshil,FrmPrintTapshil }= require("../../../controllers/Market/Reports/FrmPrintMarketReports");
const router = express.Router();

router.post("/FrmPrintMarketReports", FrmPrintMarketReports);

router.post("/FrmPrintSankshil", FrmPrintSankshil);
router.post("/FrmPrintTapshil", FrmPrintTapshil);

module.exports = router;

//http://localhost:5000/FrmPrintMarketReports

// {
//   "tradeCategoryId": "3",
//   "ulbId": "5"
// }