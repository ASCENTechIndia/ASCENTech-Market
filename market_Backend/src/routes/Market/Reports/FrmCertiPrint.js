const express = require("express");
const getFilterCompletedApplications= require("../../../controllers/Market/Reports/FrmCertiPrint");
const router = express.Router();

router.post("/getFilterCompletedApplications", getFilterCompletedApplications);

module.exports = router;