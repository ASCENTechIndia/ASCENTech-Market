const express = require("express");
const getFullApplicationDetails= require("../../../controllers/Market/Reports/getFullApplicationDetails");
const router = express.Router();

router.post("/getFullApplicationDetails", getFullApplicationDetails);

module.exports = router;

