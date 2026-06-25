const express = require("express");
const getDailyMarketDashboardData= require("../../../controllers/Market/HomePage/getDailyMarketDashboardData");
const router = express.Router();

router.post("/getDailyMarketDashboardData", getDailyMarketDashboardData);

module.exports = router;

//http://localhost:5000/getDailyMarketDashboardData

// {
//     "ulbid": "5",
//     "financial_year": "24_25",
//     "month_name": "June"
// }