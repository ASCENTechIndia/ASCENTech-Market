const express = require("express");
const {
  FrmAppliVerificationMst,
  FrmAppliVerificationList,
  getDetailedApplicationInfo,
  getSpecificTradeRate,
} = require("../../../controllers/Market/Transaction/FrmAppliVerificationMst");
const router = express.Router();

router.post("/FrmAppliVerificationMst", FrmAppliVerificationMst);
router.post("/FrmAppliVerificationList", FrmAppliVerificationList);
router.post("/getDetailedApplicationInfo", getDetailedApplicationInfo);

router.post("/getSpecificTradeRate", getSpecificTradeRate);

module.exports = router;

//http://localhost:5000/FrmAppliVerificationMst
