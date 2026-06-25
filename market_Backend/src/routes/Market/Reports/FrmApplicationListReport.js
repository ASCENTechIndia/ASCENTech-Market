const express = require("express");
const {
  FrmApplicationListReport,
  getWardNamesAndIdsByUlbId,
  getAppliPrintDetailsById,
  getAppliPrintDetails
} = require("../../../controllers/Market/Reports/FrmApplicationListReport");
const router = express.Router();

router.post("/FrmApplicationListReport", FrmApplicationListReport);
router.post("/getWardNamesAndIdsByUlbId", getWardNamesAndIdsByUlbId);
router.post("/getAppliPrintDetailsById", getAppliPrintDetailsById);
router.post("/getAppliPrintDetails", getAppliPrintDetails);

module.exports = router;

