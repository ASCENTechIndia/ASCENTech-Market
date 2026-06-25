const express = require("express");
const {FrmDocumentMasterList, BindDocumentDetails, Aomk_Doc_Ins}  = require("../../../controllers/Market/Masters/FrmDocumentMasterList");
const router = express.Router();

router.post("/FrmDocumentMasterList",  FrmDocumentMasterList);
router.post('/BindDocumentDetails', BindDocumentDetails);

router.post("/Aomk_Doc_Ins", Aomk_Doc_Ins);

module.exports = router;

//http://localhost:5000/FrmDocumentMasterList

// {
//     "orgId": 5
// }
