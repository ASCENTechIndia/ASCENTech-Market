const express = require("express");
const router = express.Router();
const { getMenus , getApplichart, getRegMonthwiseData,getTradTypeCerti,getAppliAgingReport,getApplicationRevenue,getApplicationStatus,getApplicationStatusTrend

} = require("../../../src/controllers/Admin/menuController");

router.post("/MarketMenus", getMenus);
router.post("/GetDashboardCount",getApplichart)
router.post("/GetMonthWise",getRegMonthwiseData)

router.post("/GetTradecerti", getTradTypeCerti);
router.post("/GetAgeingReport",getAppliAgingReport)

router.post("/GetApplicationRevenue", getApplicationRevenue);
router.post("/GetApplicationStatus", getApplicationStatus);
router.post("/GetApplicationStatusTrend", getApplicationStatusTrend);

module.exports = router;
