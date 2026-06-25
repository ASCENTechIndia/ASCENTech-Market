const express = require("express");
const getApplicationDetailsByNoAndDate= require("../../../controllers/Market/Reports/getApplicationDetailsByNoAndDate");
const router = express.Router();

router.post("/getApplicationDetailsByNoAndDate", getApplicationDetailsByNoAndDate);

module.exports = router;

//http://localhost:5000/getApplicationDetailsByNoAndDate