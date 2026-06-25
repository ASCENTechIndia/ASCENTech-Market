const express = require("express");
const getApplicationTradeID = require("../../../controllers/Market/Transaction/getApplicationTradeID");
const router = express.Router();

router.post("/getApplicationTradeID", getApplicationTradeID);

module.exports = router;

//http://localhost:5000/getApplicationTradeID

// {
//   "applicationId": "22"
// }