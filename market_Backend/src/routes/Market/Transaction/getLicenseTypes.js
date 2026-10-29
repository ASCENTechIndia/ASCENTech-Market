const express = require("express");
const getLicenseTypes = require("../../../controllers/Market/Transaction/getLicenseTypes");
const router = express.Router();

router.get("/getLicenseTypes", getLicenseTypes);

module.exports = router;

//http://localhost:5000/getLicenseTypes