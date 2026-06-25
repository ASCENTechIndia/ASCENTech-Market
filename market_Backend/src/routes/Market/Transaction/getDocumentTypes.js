const express = require("express");
const getDocumentTypes = require("../../../controllers/Market/Transaction/getDocumentTypes");
const router = express.Router();

router.get("/getDocumentTypes", getDocumentTypes);

module.exports = router;