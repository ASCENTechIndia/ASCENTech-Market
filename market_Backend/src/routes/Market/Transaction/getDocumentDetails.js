const express = require("express");

const {
  getDocumentDetails,
  getSiteVisitDocuments,
} = require("../../../controllers/Market/Transaction/getDocumentDetails");

const router = express.Router();

// Application Documents
router.post("/DocumentDetails", getDocumentDetails);

// Site Visit Documents
router.post("/SiteVisitDocuments", getSiteVisitDocuments);

module.exports = router;

/*
Application Documents
---------------------
POST http://localhost:5000/DocumentDetails

{
  "applicationId": "22"
}


Site Visit Documents
--------------------
POST http://localhost:5000/SiteVisitDocuments

{
  "applicationId": "23867",
  "ulbId": "1070"
}
*/