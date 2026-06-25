const express = require("express");
const router = express.Router();
const {
  FrmMenuMst,
  FrmMenuList,
} = require("../../../controllers/Market/Masters/FrmMenuMst");

router.post("/FrmMenuMst", FrmMenuMst);

router.post("/FrmMenuList", FrmMenuList);

module.exports = router;
