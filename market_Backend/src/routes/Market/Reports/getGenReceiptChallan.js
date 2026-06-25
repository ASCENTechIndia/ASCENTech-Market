const express = require("express");
const {getGenReceiptChallan, getFilteredChallanDetails, getFilteredGeneralReceipts, getRecModeConfig, getWardNamesAndIdsByUlbId } = require("../../../controllers/Market/Reports/getGenReceiptChallan");
const router = express.Router();

router.post("/getGenReceiptChallan", getGenReceiptChallan);
router.post("/getFilteredChallanDetails", getFilteredChallanDetails);
router.post("/getFilteredGeneralReceipts", getFilteredGeneralReceipts);
router.post("/getRecModeConfig", getRecModeConfig);
router.post("/getWardNamesAndIdsByUlbId", getWardNamesAndIdsByUlbId);

module.exports = router;

//http://localhost:5000/getGenReceiptChallan

// {
//   "FromDt": "01-05-2022",
//   "ToDt": "10-06-2024",
//   "PrabhagId": "1221",
//   "OrgId": "5",
//   "PayMode": "1"
// }