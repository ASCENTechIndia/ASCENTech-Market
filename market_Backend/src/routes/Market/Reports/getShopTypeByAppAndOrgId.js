const express = require("express");
const getShopTypeByAppAndOrgId= require("../../../controllers/Market/Reports/getShopTypeByAppAndOrgId");
const router = express.Router();

router.post("/getShopTypeByAppAndOrgId", getShopTypeByAppAndOrgId);

module.exports = router;

//http://localhost:5000/getShopTypeByAppAndOrgId

// {
//   "appId": "1616",
//   "orgId": "5"
// }