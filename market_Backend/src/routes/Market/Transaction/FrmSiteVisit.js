const express = require("express");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();

const upload = multer({
  storage,
});

const { getSiteVisitApplications, siteVisitVerification, uploadSiteVisitFiles } = require("../../../controllers/Market/Transaction/FrmSiteVisit");

router.post("/site-visit-applications", getSiteVisitApplications);

router.post("/application-verify", siteVisitVerification);

router.post(
  "/uploadSiteVisitFiles",
  upload.fields([
    { name: "visitPhoto", maxCount: 1 },
    { name: "visitDocument", maxCount: 1 },
  ]),
  uploadSiteVisitFiles,
);

module.exports = router;
