const express = require("express");
const getAppliPrintDetails= require("../../../controllers/Market/Reports/getAppliPrintDetails");
const router = express.Router();

router.post("/getAppliPrintDetails", getAppliPrintDetails);

module.exports = router;

//http://localhost:5000/getAppliPrintDetails

// {
//   "ulbId": "5",
//   "wardId": "181",
//   "shopName": "GIFT SHOP",
//   "panCardNo": "APOP9999A",
//   "FromDt": "01-09-2022",
//   "ToDt": "29-09-2022"
// }