const express = require("express");
const {aomk_bill_ins,aomk_appli_auth_ins} = require("../../../controllers/Market/Transaction/aomk_appli_auth_ins");
const router = express.Router();

router.post("/aomk_appli_auth_ins", aomk_appli_auth_ins);
router.post("/aomk_bill_ins", aomk_bill_ins);

module.exports = router;