const express = require("express");
const getReceiptDetails = require("../../../controllers/Market/Transaction/getReceiptDetails");
const router = express.Router();

router.post("/getReceiptDetails", getReceiptDetails);

module.exports = router;
