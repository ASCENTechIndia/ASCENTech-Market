const express = require("express");
const getChallanReport= require("../../../controllers/Market/Reports/getChallanReport");
const router = express.Router();

router.post("/getChallanReport", getChallanReport);

module.exports = router;

//http://localhost:5000/getChallanReport

// {
//   "ulbId": "5",
//   "FromDt": "01-06-2022",
//   "ToDt": "10-06-2024",
//   "ZoneId": "181",
//   "PayModeId": "1"
// }