const express = require("express");
const BindTradeTypeDetails = require("../../../controllers/Market/Masters/BindTradeTypeDetails");
const router = express.Router();

router.post("/BindTradeTypeDetails", BindTradeTypeDetails);

module.exports = router;

//http://localhost:5000/BindTradeTypeDetails


// {
//     "tradeTypeId": 1035,  
//     "orgId": 5        
// }