const express = require("express");
const getCertificateFromAppliMas = require("../../../controllers/Market/Transaction/getCertificateFromAppliMas");
const router = express.Router();

router.post("/getCertificateFromAppliMas", getCertificateFromAppliMas);

module.exports = router;