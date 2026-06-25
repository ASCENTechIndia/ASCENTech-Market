const express = require("express");
const getCertificateFrmView = require("../../../controllers/Market/Transaction/getCertificateFrmView");
const router = express.Router();

router.post("/getCertificateFrmView", getCertificateFrmView);

module.exports = router;
