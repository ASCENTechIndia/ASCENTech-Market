const express = require("express");
const PrintCollectionReceipt = require("../../../controllers/Market/Transaction/PrintCollectionReceipt");
const router = express.Router();

router.post("/PrintCollectionReceipt", PrintCollectionReceipt);

module.exports = router;