const express = require("express");
const router = express.Router();

const {
  getApplicationDetails,
} = require("../../../controllers/Market/Transaction/GetAutofillAuth.js"); // ✅ correct path

router.post("/get-application-details", getApplicationDetails); // ✅ Don't call the function

module.exports = router;
