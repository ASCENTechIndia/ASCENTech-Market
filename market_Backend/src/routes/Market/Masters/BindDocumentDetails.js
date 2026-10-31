const express = require('express');
const router = express.Router();
const BindDocumentDetails = require('../../../controllers/Market/Masters/BindDocumentDetails'); 

router.post('/BindDocumentDetails', BindDocumentDetails);

module.exports = router;

//http://localhost:5000/BindDocumentDetails

// {
//     "documentId": 221,  
//     "orgId": 5       
// }