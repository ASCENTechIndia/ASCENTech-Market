const express = require("express");
const {FrmApplicationEntryAuthList, getApplicationTypes, getDirectorDetailsWithApplicationId }= require("../../../controllers/Market/Transaction/FrmApplicationEntryAuthList");
const router = express.Router();

router.post("/FrmApplicationEntryAuthList", FrmApplicationEntryAuthList);
router.post("/getApplicationTypes", getApplicationTypes);

router.post("/getDirectorDetailsWithApplicationId", getDirectorDetailsWithApplicationId);

module.exports = router;

//http://localhost:5000/FrmApplicationEntryAuthList