const express = require("express");
const getDocumentTypesByUlbId = require("../../../controllers/Market/Transaction/getDocumentTypesByUlbId");
const router = express.Router();

router.post("/getDocumentTypesByUlbId", getDocumentTypesByUlbId);

module.exports = router;

//http://localhost:5000/getDocumentTypesByUlbId