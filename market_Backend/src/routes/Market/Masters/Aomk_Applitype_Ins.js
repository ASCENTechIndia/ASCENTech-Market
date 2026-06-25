const express = require("express");
const {Aomk_Applitype_Ins, FrmApplicantTypeList, FrmApplicantTypeMst} = require("../../../controllers/Market/Masters/Aomk_Applitype_Ins");
const router = express.Router();

router.post("/Aomk_Applitype_Ins", Aomk_Applitype_Ins);
router.post("/FrmApplicantTypeList", FrmApplicantTypeList);
router.post('/FrmApplicantTypeMst', FrmApplicantTypeMst);

module.exports = router;