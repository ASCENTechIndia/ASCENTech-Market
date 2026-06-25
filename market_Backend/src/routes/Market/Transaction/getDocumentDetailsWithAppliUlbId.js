const express = require("express");
const getDocumentDetailsWithAppliUlbId = require("../../../controllers/Market/Transaction/getDocumentDetailsWithAppliUlbId");
const router = express.Router();

router.post("/getDocumentDetailsWithAppliUlbId", getDocumentDetailsWithAppliUlbId);

module.exports = router;