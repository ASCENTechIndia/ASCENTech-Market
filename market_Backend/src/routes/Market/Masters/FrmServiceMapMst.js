const express = require("express");
const router = express.Router();
const {
  FrmServiceMapMst,
  aomk_serviceaccmap_ins,
  getServices,
  FrmServiceMapList
} = require("../../../controllers/Market/Masters/FrmServiceMapMst");

router.post("/FrmServiceMapMst", FrmServiceMapMst);
router.post("/aomk_serviceaccmap_ins", aomk_serviceaccmap_ins);

router.get('/getServices', getServices);
router.post("/FrmServiceMapList", FrmServiceMapList);

module.exports = router;

