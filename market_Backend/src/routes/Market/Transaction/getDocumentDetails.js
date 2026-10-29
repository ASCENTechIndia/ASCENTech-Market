const express = require("express");
const getDocumentDetails = require("../../../controllers/Market/Transaction/getDocumentDetails");
const router = express.Router();

router.post("/DocumentDetails", getDocumentDetails);

module.exports = router;

//http://localhost:5000/DocumentDetails

// {
//   "applicationId": "22"
// }