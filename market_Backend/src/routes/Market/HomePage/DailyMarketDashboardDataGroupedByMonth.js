const express = require("express");
const DailyMarketDashboardDataGroupedByMonth = require("../../../controllers/Market/HomePage/DailyMarketDashboardDataGroupedByMonth");
const router = express.Router();

router.post("/DailyMarketDashboardDataGroupedByMonth", DailyMarketDashboardDataGroupedByMonth);

module.exports = router;

//http://localhost:5000/DailyMarketDashboardDataGroupedByMonth