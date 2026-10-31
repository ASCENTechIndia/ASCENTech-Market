const express = require("express");
const getUsers= require("../../../controllers/Market/Reports/getUsers");
const router = express.Router();

router.post("/getUsers", getUsers);

module.exports = router;

//http://localhost:5000/getUsers