const express = require("express");
const aomk_ulbtip_ins = require("../../../controllers/Market/Masters/aomk_ulbtip_ins");
const router = express.Router();

router.post("/aomk_ulbtip_ins", aomk_ulbtip_ins);

module.exports = router;