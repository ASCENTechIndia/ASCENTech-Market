const express = require('express');
const { login } = require('../../../src/controllers/Admin/authController');

const router = express.Router();

// Route for user login
router.post("/Marketlogin", login);

module.exports = router;