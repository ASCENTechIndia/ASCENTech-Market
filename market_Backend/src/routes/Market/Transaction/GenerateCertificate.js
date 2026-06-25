const express = require("express");
const GenerateCertificate = require("../../../controllers/Market/Transaction/GenerateCertificate");
const router = express.Router();

router.post("/GenerateCertificate", GenerateCertificate);

module.exports = router;
