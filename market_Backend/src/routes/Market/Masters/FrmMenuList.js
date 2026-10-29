const express = require("express");
const FrmMenuList = require("../../../controllers/Market/Masters/FrmMenuList");
const router = express.Router();

router.post("/FrmMenuList", FrmMenuList);

module.exports = router;

//http://localhost:5000/FrmMenuList

// {
//     "dept_id": "18"
// }