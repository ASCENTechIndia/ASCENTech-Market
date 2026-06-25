const express = require("express");
const {
  FrmApplicationEntryMst,
  getLicenseTypes,
  getApplicationTradeDetailsByAppId,
  getWardName,
  getDistinctZones,
  getTradeTypesByCategory,
  getAppliTradeTypeDetails,
  getApplicationDetails, aomk_appli_ins,
} = require("../../../controllers/Market/Transaction/FrmApplicationEntryMst");
const router = express.Router();

router.post("/FrmApplicationEntryMst", FrmApplicationEntryMst);

router.get("/getLicenseTypes", getLicenseTypes);
router.post(
  "/getApplicationTradeDetailsByAppId",
  getApplicationTradeDetailsByAppId
);

router.post("/getWardName", getWardName);

router.post("/getDistinctZones", getDistinctZones);

router.post("/getTradeTypesByCategory", getTradeTypesByCategory);


router.post("/getAppliTradeTypeDetails", getAppliTradeTypeDetails);

router.post("/get-application-details", getApplicationDetails);
router.post("/aomk_appli_ins", aomk_appli_ins);

module.exports = router;

//http://localhost:5000/FrmApplicationEntryMst
