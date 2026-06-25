const express = require("express");
const { logoutUser } = require("../../controllers/Admin/logoutController");

const router = express.Router();

// POST /api/logout
router.post("/logout", logoutUser);

module.exports = router;
