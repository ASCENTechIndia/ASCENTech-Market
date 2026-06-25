const express = require("express");
const BindApplicationDtlsForGenerateCerti = require("../../../controllers/Market/Transaction/BindApplicationDtlsForGenerateCerti");
const router = express.Router();

router.post("/BindApplicationDtlsForGenerateCerti", BindApplicationDtlsForGenerateCerti);

module.exports = router;

//http://localhost:5000/BindApplicationDtlsForGenerateCerti