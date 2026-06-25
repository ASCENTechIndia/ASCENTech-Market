const express = require("express");
const getCollectionDetails = require("../../../controllers/Market/Transaction/getCollectionDetails");
const router = express.Router();

router.post("/getCollectionDetails", getCollectionDetails);

module.exports = router;

//http://localhost:5000/getCollectionDetails