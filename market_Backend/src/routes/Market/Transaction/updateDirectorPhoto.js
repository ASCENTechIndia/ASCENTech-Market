const express = require("express");
const multer = require("multer");
const updateDirectorPhoto = require("../../../controllers/Market/Transaction/updateDirectorPhoto");
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/updateDirectorPhoto", upload.single('imagedata'), updateDirectorPhoto);

module.exports = router;