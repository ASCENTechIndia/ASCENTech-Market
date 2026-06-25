const express = require("express");
const router = express.Router();
const { getSiteVisitApplications } = require("../../../controllers/Market/Transaction/FrmSiteVisit");

router.post("/site-visit-applications", getSiteVisitApplications);

module.exports = router;
