const express = require("express");
const getApplicationTypes = require("../../../controllers/Market/Transaction/getApplicationTypes");
const router = express.Router();

router.post("/getApplicationTypes", getApplicationTypes);

module.exports = router;

//http://localhost:5000/getApplicationTypes

// {
//   "ulbId": "5"
// }