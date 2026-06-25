const express = require("express");
const getFilteredGeneralReceipts= require("../../../controllers/Market/Reports/getFilteredGeneralReceipts");
const router = express.Router();

router.post("/getFilteredGeneralReceipts", getFilteredGeneralReceipts);

module.exports = router;

//http://localhost:5000/getFilteredGeneralReceipts

// {
//   "FromDt": "01-05-2022",
//   "ToDt": "10-06-2024",
//   "PrabhagId": "181",
//   "OrgId": "5",
//   "PayMode": "1"
// }