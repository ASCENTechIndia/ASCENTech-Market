const express = require('express');
const router = express.Router();
const FrmApplicantTypeMst = require('../../../controllers/Market/Masters/FrmApplicantTypeMst'); 

router.post('/FrmApplicantTypeMst', FrmApplicantTypeMst);

module.exports = router;

//http://localhost:5000/FrmApplicantTypeMst

// {
//     "appliTypeId": 81, 
//     "orgId": 5          
// }
