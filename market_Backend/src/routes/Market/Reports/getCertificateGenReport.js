const express = require("express");
const getCertificateGenReport= require("../../../controllers/Market/Reports/getCertificateGenReport");
const router = express.Router();

router.post("/getCertificateGenReport", getCertificateGenReport);

module.exports = router;

