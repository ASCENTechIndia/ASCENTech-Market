const express = require("express");
const getWardNamesAndIdsByUlbId= require("../../../controllers/Market/Reports/getWardNamesAndIdsByUlbId");
const router = express.Router();

router.post("/getWardNamesAndIdsByUlbId", getWardNamesAndIdsByUlbId);

module.exports = router;