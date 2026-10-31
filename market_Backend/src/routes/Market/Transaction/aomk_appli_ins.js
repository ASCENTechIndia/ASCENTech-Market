const express = require("express");
const aomk_appli_ins = require("../../../controllers/Market/Transaction/aomk_appli_ins");
const router = express.Router();

router.post("/aomk_appli_ins", aomk_appli_ins);

module.exports = router;