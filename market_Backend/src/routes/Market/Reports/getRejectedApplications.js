const express = require("express");
const getRejectedApplications= require("../../../controllers/Market/Reports/getRejectedApplications");
const router = express.Router();

router.post("/getRejectedApplications", getRejectedApplications);

module.exports = router;
