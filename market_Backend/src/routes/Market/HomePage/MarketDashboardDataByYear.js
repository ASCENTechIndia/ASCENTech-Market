const express = require("express");
const MarketDashboardDataByYear = require("../../../controllers/Market/HomePage/MarketDashboardDataByYear");
const router = express.Router();

router.post("/MarketDashboardDataByYear", MarketDashboardDataByYear);

module.exports = router;

//http://localhost:5000/MarketDashboardDataByYear

// {
//     "ulbid": "5",
//     "year": "24_25"
// }