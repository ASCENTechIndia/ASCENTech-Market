const express = require("express");
const FrmApplicantTypeList = require("../../../controllers/Market/Masters/FrmApplicantTypeList");
const router = express.Router();

router.post("/FrmApplicantTypeList", FrmApplicantTypeList);

module.exports = router;

//http://localhost:5000/FrmApplicantTypeList

// {
//     "orgId": 5
// }