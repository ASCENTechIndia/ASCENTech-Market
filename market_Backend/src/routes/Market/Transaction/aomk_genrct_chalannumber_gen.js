const express = require("express");
const aomk_genrct_chalannumber_gen = require("../../../controllers/Market/Transaction/aomk_genrct_chalannumber_gen");
const router = express.Router();

router.post("/aomk_genrct_chalannumber_gen", aomk_genrct_chalannumber_gen);

module.exports = router;