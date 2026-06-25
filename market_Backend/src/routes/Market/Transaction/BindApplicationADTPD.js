const express = require("express");
const BindApplicationADTPD = require("../../../controllers/Market/Transaction/BindApplicationADTPD");
const router = express.Router();

router.post("/BindApplicationADTPD", BindApplicationADTPD);

module.exports = router;

//http://localhost:5000/BindApplicationADTPD