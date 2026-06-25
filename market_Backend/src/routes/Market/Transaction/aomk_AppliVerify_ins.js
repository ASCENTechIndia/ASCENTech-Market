const express = require("express");
const aomk_AppliVerify_ins = require("../../../controllers/Market/Transaction/aomk_AppliVerify_ins");
const router = express.Router();

router.post("/aomk_AppliVerify_ins", aomk_AppliVerify_ins);

module.exports = router;
