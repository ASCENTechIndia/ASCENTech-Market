const express = require("express");
const getWardName = require("../../../controllers/Market/Transaction/getWardName");
const router = express.Router();

router.post("/getWardName", getWardName);

module.exports = router;
