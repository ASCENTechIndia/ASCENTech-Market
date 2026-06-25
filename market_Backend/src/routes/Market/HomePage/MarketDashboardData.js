const express = require("express");
const {MarketDashboardData, getMenus ,getApplicationDetails,
  getDashboardCounts,
  getPieChartData,
  getApplicationsByMonth,getAgingApplications, getRejectedApplications} = require("../../../controllers/Market/HomePage/MarketDashboardData");
const router = express.Router();

router.post("/MarketDashboardData", MarketDashboardData);
router.get('/fireMenus', getMenus);
router.get("/application-details", getApplicationDetails);
router.get("/dashboard-counts", getDashboardCounts);
router.get("/pie-chart", getPieChartData);
router.get("/applications-by-month", getApplicationsByMonth);
router.get("/agingapplications", getAgingApplications);
router.get("/rejectapplication",getRejectedApplications)

module.exports = router;


//http://localhost:5000/MarketDashboardData

// {
//     "ulbid": "5"
// }
