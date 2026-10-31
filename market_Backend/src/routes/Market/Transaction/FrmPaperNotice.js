const express = require("express");
const router = express.Router();
const {
  getApplicationList,
  getTradeCategory,
  getTradeList,

  getApplicationDetails,
  getAppTradeTypeDetails,
  getAppTradeDetails,
  getDirectorDetailsWithApplicationId,
  getApplicationDocuments,
  getAdtpItems,
  getSdItems
} = require("../../../controllers/Market/Transaction/FrmPaperNotice");

router.post("/ApplicationList", getApplicationList);
router.post("/TradeCategory", getTradeCategory);
router.post("/TradeList", getTradeList);

router.post("/ApplicationDetails", getApplicationDetails);
router.post("/AppTradeTypeDetails", getAppTradeTypeDetails);
router.post("/AppTradeDetails", getAppTradeDetails);
router.post("/DirectorDetails", getDirectorDetailsWithApplicationId);
router.post("/ApplicationDocuments", getApplicationDocuments);
router.post("/getAdtpItems", getAdtpItems);
router.post("/SdItems", getSdItems);

module.exports = router;


