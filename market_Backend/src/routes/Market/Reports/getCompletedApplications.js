const express = require("express");
const getCompletedApplications= require("../../../controllers/Market/Reports/getCompletedApplications");
const router = express.Router();

router.post("/getCompletedApplications", getCompletedApplications);

module.exports = router;