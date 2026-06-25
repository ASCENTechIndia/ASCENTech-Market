const express = require("express");
const FrmDailyCollRpt= require("../../../controllers/Market/Reports/FrmDailyCollRpt");
const router = express.Router();

router.post("/FrmDailyCollRpt", FrmDailyCollRpt);

module.exports = router;

//http://localhost:5000/FrmDailyCollRpt

