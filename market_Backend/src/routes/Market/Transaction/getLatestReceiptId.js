const express = require("express");
const  getLatestReceiptId  = require("../../../controllers/Market/Transaction/getLatestReceiptId");
const router = express.Router();

router.post("/getLatestReceiptId",  getLatestReceiptId);

module.exports = router;

//http://localhost:5000/getLatestReceiptId