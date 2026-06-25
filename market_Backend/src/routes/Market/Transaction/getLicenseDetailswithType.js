const express = require("express");
const getLicenseDetailswithType = require("../../../controllers/Market/Transaction/getLicenseDetailswithType");
const router = express.Router();

router.post("/getLicenseDetailswithType", getLicenseDetailswithType);

module.exports = router;

//http://localhost:5000/getLicenseDetailswithType