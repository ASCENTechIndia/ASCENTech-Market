const express = require("express");
const FrmActivityLogRpt = require("../../../controllers/Market/Reports/FrmActivityLogRpt");
const router = express.Router();

router.post("/FrmActivityLogRpt", FrmActivityLogRpt);

module.exports = router;
