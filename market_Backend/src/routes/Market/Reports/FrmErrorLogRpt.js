const express = require("express");
const {FrmErrorLogRpt, getUsers} = require("../../../controllers/Market/Reports/FrmErrorLogRpt");
const router = express.Router();

router.post("/FrmErrorLogRpt", FrmErrorLogRpt);
router.post("/getUsers", getUsers);

module.exports = router;
