const express = require("express");
const FrmLicenseEntryList = require("../../../controllers/Market/Transaction/FrmLicenseEntryList");
const router = express.Router();

router.post("/FrmLicenseEntryList", FrmLicenseEntryList);

module.exports = router;

//http://localhost:5000/FrmLicenseEntryList