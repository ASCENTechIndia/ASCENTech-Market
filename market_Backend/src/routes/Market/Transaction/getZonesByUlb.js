const express = require("express");
const router = express.Router();
const { getZonesByUlb } = require("../../../controllers/Market/Transaction/getZonesByUlb");

router.post("/get-zones", getZonesByUlb);

module.exports = router;
