const express = require("express");
const getAdditionalItems = require("../../../controllers/Market/Transaction/getAdditionalItems");
const router = express.Router();

router.get("/getAdditionalItems", getAdditionalItems);

module.exports = router;

//http://localhost:5000/getAdditionalItems