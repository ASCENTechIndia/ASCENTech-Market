const express = require("express");
const MarketDashboardDataByMonth = require("../../../controllers/Market/HomePage/MarketDashboardDataByMonth");
const router = express.Router();

router.post("/MarketDashboardDataByMonth", MarketDashboardDataByMonth);

module.exports = router;

//http://localhost:5000/MarketDashboardDataByMonth

// {
//     "ulbid": "5"
// }