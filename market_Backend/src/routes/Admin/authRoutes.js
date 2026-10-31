// const express = require('express');
// const { login } = require('../../../src/controllers/Admin/authController');

// const router = express.Router();

// // Route for user login
// router.post("/Marketlogin", login);

// module.exports = router;


const express = require('express');
const { login, authLogin,  checkJwt, getMe, refreshToken, logout,getCurrentUser } = require('../../../src/controllers/Admin/authController');
const { getWardID } = require('../../../src/controllers/Admin/authController');

const router = express.Router();

// Route for user login
router.post("/login", login);

router.get("/ward/:zoneID", async (req, res) => {
  try {
    const zoneID = parseInt(req.params.zoneID, 10);
    if (isNaN(zoneID)) {
      return res.status(400).json({ error: "Invalid zone ID" });
    }

    const wardID = await getWardID(zoneID);
    if (wardID) {
      res.json({ wardID });
    } else {
      res.status(404).json({ error: "Ward ID not found" });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const  isValidToken  = require('../../../src/controllers/Admin/isValidToken');

router.post('/validate-token', isValidToken);
router.post("/api/login", authLogin);
router.get("/api/me", checkJwt, getMe);
router.post("/api/refresh", refreshToken);
router.post("/api/logout", logout);
router.get("/me", getCurrentUser);


module.exports = router;