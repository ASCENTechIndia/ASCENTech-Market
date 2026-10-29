const express = require("express");
const FrmAppliVerificationList = require("../../../controllers/Market/Transaction/FrmAppliVerificationList");
const router = express.Router();

router.post("/FrmAppliVerificationList", FrmAppliVerificationList);

module.exports = router;
