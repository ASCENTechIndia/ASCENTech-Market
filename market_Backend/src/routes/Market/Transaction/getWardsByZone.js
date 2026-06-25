const express = require("express");
const router = express.Router();
const { getWardsByZone } = require("../../../controllers/Market/Transaction/getWardsByZone");

router.post("/getWards", getWardsByZone);

module.exports = router;
