const express = require("express");
const router = express.Router();
const {
  FrmUlbTipMst,
  FrmUlbTipList,
  aomk_ulbtip_ins,
} = require("../../../controllers/Market/Masters/FrmUlbTipMst");

router.post("/FrmUlbTipMst", FrmUlbTipMst);

router.post("/FrmUlbTipList", FrmUlbTipList);
router.post("/aomk_ulbtip_ins", aomk_ulbtip_ins);

module.exports = router;

