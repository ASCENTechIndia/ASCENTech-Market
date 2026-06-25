const express = require("express");
const {Aomk_Trade_Ins, FrmTradeMst, FrmTradeList} = require("../../../controllers/Market/Masters/Aomk_Trade_Ins");
const router = express.Router();

router.post("/Aomk_Trade_Ins", Aomk_Trade_Ins);
router.post('/FrmTradeMst', FrmTradeMst);
router.post('/FrmTradeList', FrmTradeList);

module.exports = router;