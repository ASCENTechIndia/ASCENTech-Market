const express = require("express");
const router = express.Router();
const { GetUserlist,GetUserDropdownList } = require("../../../controllers/Market/Transaction/UserController");

// POST route to get the user list
router.post("/get-userlist", GetUserlist);
router.post("/getUserDropdownList", GetUserDropdownList);

module.exports = router;