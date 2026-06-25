const express = require("express");
const fetchBankNames = require("../../../controllers/Market/Transaction/fetchBankNames");
const router = express.Router();

router.post("/fetchBankNames", fetchBankNames);

module.exports = router;

//http://localhost:5000/fetchBankNames