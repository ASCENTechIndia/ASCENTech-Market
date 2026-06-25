const express = require("express");
const FrmLicenceRegister= require("../../../controllers/Market/Reports/FrmLicenceRegister");
const router = express.Router();

router.post("/FrmLicenceRegister", FrmLicenceRegister);

module.exports = router;