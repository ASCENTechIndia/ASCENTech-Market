const express = require("express");
const MarketDashboardData = require("../../../controllers/Market/HomePage/MarketDashboardData");
const router = express.Router();

router.post("/MarketDashboardData", MarketDashboardData);

module.exports = router;

//http://localhost:5000/MarketDashboardData

// {
//     "ulbid": "5"
// }
