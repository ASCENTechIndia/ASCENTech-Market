const express = require("express");
const FrmReceiptReprint= require("../../../controllers/Market/Reports/FrmReceiptReprint");
const router = express.Router();

router.post("/FrmReceiptReprint", FrmReceiptReprint);

module.exports = router;

//http://localhost:5000/FrmReceiptReprint