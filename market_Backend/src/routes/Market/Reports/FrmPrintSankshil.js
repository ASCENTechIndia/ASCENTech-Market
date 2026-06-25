const express = require("express");
const FrmPrintSankshil= require("../../../controllers/Market/Reports/FrmPrintSankshil");
const router = express.Router();

router.post("/FrmPrintSankshil", FrmPrintSankshil);

module.exports = router;