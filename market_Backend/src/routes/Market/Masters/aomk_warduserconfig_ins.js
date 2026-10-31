const express = require("express");
const aomk_warduserconfig_ins = require("../../../controllers/Market/Masters/aomk_warduserconfig_ins");
const router = express.Router();

router.post("/aomk_warduserconfig_ins", aomk_warduserconfig_ins);

module.exports = router;