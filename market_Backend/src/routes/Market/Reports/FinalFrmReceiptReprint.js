const express = require("express");
const FinalFrmReceiptReprint= require("../../../controllers/Market/Reports/FinalFrmReceiptReprint");
const router = express.Router();

router.post("/FinalFrmReceiptReprint", FinalFrmReceiptReprint);

module.exports = router;

//http://localhost:5000/FinalFrmReceiptReprint
