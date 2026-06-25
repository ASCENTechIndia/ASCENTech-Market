const express = require("express");
const getFilteredReceiptDetails= require("../../../controllers/Market/Reports/getFilteredReceiptDetails");
const router = express.Router();

router.post("/getFilteredReceiptDetails", getFilteredReceiptDetails);

module.exports = router;

//http://localhost:5000/getFilteredReceiptDetails

// {
//   "FromDt": "01-05-2022",
//   "ToDt": "10-06-2024",
//   "OrgId": "5",
//   "ZoneId": "-1",
//   "TradeCategoryId": "-1",
//   "TradeTypeId": "-1"
// }