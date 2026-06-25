const express = require("express");
const FrmCollectionList = require("../../../controllers/Market/Transaction/FrmCollectionList");
const router = express.Router();

router.post("/FrmCollectionList", FrmCollectionList);

module.exports = router;

//http://localhost:5000/FrmCollectionList