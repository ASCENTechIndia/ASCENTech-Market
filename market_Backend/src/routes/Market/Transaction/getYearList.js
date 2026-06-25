const express = require("express");
const getYearList = require("../../../controllers/Market/Transaction/getYearList");
const router = express.Router();

router.get("/getYearList", getYearList);

module.exports = router;
