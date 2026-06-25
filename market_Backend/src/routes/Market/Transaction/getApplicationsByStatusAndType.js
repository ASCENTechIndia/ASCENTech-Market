const express = require("express");
const getApplicationsByStatusAndType = require("../../../controllers/Market/Transaction/getApplicationsByStatusAndType");
const router = express.Router();

router.post("/getApplicationsByStatusAndType", getApplicationsByStatusAndType);

module.exports = router;

//http://localhost:5000/getApplicationsByStatusAndType