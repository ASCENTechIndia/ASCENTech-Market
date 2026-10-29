const express = require("express");
const aomk_serviceaccmap_ins = require("../../../controllers/Market/Masters/aomk_serviceaccmap_ins");
const router = express.Router();

router.post("/aomk_serviceaccmap_ins", aomk_serviceaccmap_ins);

module.exports = router;