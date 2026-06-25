const express = require("express");
const getCorporationCode = require("../../../controllers/Market/Transaction/getCorporationCode");
const router = express.Router();

router.post("/getCorporationCode",getCorporationCode);

module.exports = router;

//http://localhost:5000/getCorporationCode

// {
//   "ulbId": "5"
// }