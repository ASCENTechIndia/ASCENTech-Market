const express = require("express");
const FrmApplicationEntryList = require("../../../controllers/Market/Transaction/FrmApplicationEntryList");
const router = express.Router();

router.post("/FrmApplicationEntryList", FrmApplicationEntryList);

module.exports = router;

//http://localhost:5000/FrmApplicationEntryList