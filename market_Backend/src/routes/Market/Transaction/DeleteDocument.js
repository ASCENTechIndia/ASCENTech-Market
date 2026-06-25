const express = require("express");
const DeleteDocument = require("../../../controllers/Market/Transaction/DeleteDocument");
const router = express.Router();

router.post("/DeleteDocument", DeleteDocument);

module.exports = router;