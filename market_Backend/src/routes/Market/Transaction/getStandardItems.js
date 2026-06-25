const express = require("express");
const getStandardItems = require("../../../controllers/Market/Transaction/getStandardItems");
const router = express.Router();

router.get("/getStandardItems", getStandardItems);

module.exports = router;

//http://localhost:5000/getStandardItems