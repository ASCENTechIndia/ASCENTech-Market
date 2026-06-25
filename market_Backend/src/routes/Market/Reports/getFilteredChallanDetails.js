const express = require("express");
const getFilteredChallanDetails= require("../../../controllers/Market/Reports/getFilteredChallanDetails");
const router = express.Router();

router.post("/getFilteredChallanDetails", getFilteredChallanDetails);

module.exports = router;

