


const express = require("express");
const {FrmApplicationVerifyList, FrmSDItemsList, FrmApplicationDetailsById,GetApplicationTradeType, FrmTradeCategoryList, getTradeList, postAdtpItems, insertApplicationVerify,getTradeRateTypes } = require("../../../controllers/Market/Transaction/FrmApplicationVerifyList");
const router = express.Router();

router.post("/FrmApplicationVerifyList", FrmApplicationVerifyList);
router.post("/FrmSDItemsList", FrmSDItemsList);
router.post("/FrmApplicationDetailsById", FrmApplicationDetailsById);
router.post("/GetApplicationTradeType", GetApplicationTradeType);
router.post("/tradeCategoryList", FrmTradeCategoryList);
router.post("/getTradeList", getTradeList);
router.post("/adtpItems", postAdtpItems);
router.post("/insertApplicationVerify", insertApplicationVerify);
router.post("/getTradeRateTypes", getTradeRateTypes);

module.exports = router; 







