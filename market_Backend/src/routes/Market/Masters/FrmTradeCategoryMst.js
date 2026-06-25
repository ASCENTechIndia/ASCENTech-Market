const express = require("express");
const router = express.Router();
const {
  FrmTradeCategoryMst,
  FrmTradeCategoryList,
  Aomk_TradeCategory_Ins
} = require("../../../controllers/Market/Masters/FrmTradeCategoryMst");

router.post("/FrmTradeCategoryMst", FrmTradeCategoryMst);
router.post("/FrmTradeCategoryList", FrmTradeCategoryList);
router.post("/Aomk_TradeCategory_Ins", Aomk_TradeCategory_Ins);
module.exports = router;

