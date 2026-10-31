const express = require("express");
const FrmServiceMapList = require("../../../controllers/Market/Masters/FrmServiceMapList");
const router = express.Router();

router.post("/FrmServiceMapList", FrmServiceMapList);

module.exports = router;

//http://localhost:5000/FrmServiceMapList

// {
//   "ulbid": 5
// }
