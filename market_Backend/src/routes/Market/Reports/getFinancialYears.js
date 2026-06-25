const express = require("express");
const getFinancialYears= require("../../../controllers/Market/Reports/getFinancialYears");
const router = express.Router();

router.get("/getFinancialYears", getFinancialYears);

module.exports = router;

//http://localhost:5000/getFinancialYears