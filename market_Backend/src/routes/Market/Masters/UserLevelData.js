const express = require("express");
const UserLevelData = require("../../../controllers/Market/Masters/UserLevelData");
const router = express.Router();

router.get("/UserLevelData", UserLevelData);

module.exports = router;
