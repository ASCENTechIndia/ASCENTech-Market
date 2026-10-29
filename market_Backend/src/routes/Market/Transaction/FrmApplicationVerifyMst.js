


const express = require("express");
const multer = require("multer");

const {FrmApplicationTradeDetails, updateSiteReport,
  uploadDirectorPhoto,
  updateReport,
  updateADTPSiteReport,
  updateSiteReportItem5,
  getRate,
  getRateByTradeType,
  updateRateByTradeType,
  getRateAmountByIds,
  getApplicationDocumentsDetails,
  getApplicationDirectorsDetails,
  getVerifiedApplicationsDetails } = require("../../../controllers/Market/Transaction/FrmApplicationVerifyMst");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/FrmApplicationTradeDetails", FrmApplicationTradeDetails);

router.post(
  "/updateSiteReport",
  upload.single("filedata"), // <--- Multer expects this name
  updateSiteReport
);

router.post(
  "/uploadDirectorPhoto",
  upload.single("filedata"),
  uploadDirectorPhoto
);


router.post("/updateReport", upload.single("filedata"), updateReport);

router.post(
  "/updateADTPSiteReport",
  upload.single("filedata"),
  updateADTPSiteReport
);

router.post(
  "/updateSiteReportItem5",
  upload.single("filedata"),
  updateSiteReportItem5
);

router.post("/getRate", getRate);

router.post("/getRateByTradeType", getRateByTradeType);

router.post("/updateRateByTradeType", updateRateByTradeType);

router.post("/getRateAmountByIds", getRateAmountByIds);

router.post("/getApplicationDocumentsDetails", getApplicationDocumentsDetails);

router.post("/getApplicationDirectorsDetails", getApplicationDirectorsDetails);

router.post("/getVerifiedApplicationsDetails", getVerifiedApplicationsDetails);


module.exports = router; 







