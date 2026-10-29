const express = require("express");
const Aomk_Doc_Ins = require("../../../controllers/Market/Masters/Aomk_Doc_Ins");
const router = express.Router();

router.post("/Aomk_Doc_Ins", Aomk_Doc_Ins);

module.exports = router;