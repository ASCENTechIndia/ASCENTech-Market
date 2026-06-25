const express = require("express");
const {
  aomk_receptcollection_ins,
} = require("../../../controllers/Market/Transaction/aomk_receptcollection_ins");
const router = express.Router();

router.post("/aomk_receptcollection_ins", aomk_receptcollection_ins);

module.exports = router;
