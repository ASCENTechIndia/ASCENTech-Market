const express = require("express");
const getUserDigiCertKey = require("../../../controllers/Market/Transaction/getUserDigiCertKey");
const router = express.Router();

router.post("/getUserDigiCertKey", getUserDigiCertKey);

module.exports = router;
