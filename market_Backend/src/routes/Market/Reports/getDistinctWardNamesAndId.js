const express = require("express");
const getDistinctWardNamesAndId= require("../../../controllers/Market/Reports/getDistinctWardNamesAndId");
const router = express.Router();

router.post("/getDistinctWardNamesAndId", getDistinctWardNamesAndId);

module.exports = router;

//http://localhost:5000/getDistinctWardNamesAndId