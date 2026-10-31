const express = require("express");
const getAppliPrintDetailsById= require("../../../controllers/Market/Reports/getAppliPrintDetailsById");
const router = express.Router();

router.post("/getAppliPrintDetailsById", getAppliPrintDetailsById);

module.exports = router;

//http://localhost:5000/getAppliPrintDetailsById

// {
//   "id": "389",
//   "applino": "MK389",
//   "ulbId": "1"
// }