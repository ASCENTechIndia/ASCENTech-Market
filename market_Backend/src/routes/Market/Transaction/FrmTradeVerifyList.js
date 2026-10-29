const express = require("express");
const multer = require('multer'); 
const upload = multer({ storage: multer.memoryStorage() }); 


const {
getWardConfigUserList ,
getTradeServiceAppStatus ,
getTradeServiceADVList ,
getTradeServiceTLCRBList ,
getTradeServiceList ,
getTradeServiceDetailsByAppNo ,
getSdItemsWithBlobs ,
getSdItems ,
getMarketLicenseDetailsByLicenseNoAndOrg ,
getApplicationDirectors ,
getTradeNameDetails ,
getTradeNamePhotoDetails ,
getTradeAddressDetails ,
getTradeBusinessDetails ,
getShopTypeByAppliId ,
getTradeAuthDate ,
getOldDataHistory ,
getTradeTypeDetails ,
getTradeDirectorDetails ,
getTradeNameDetailsWithPhoto ,
getServiceDocumentsWithImages ,
getApplicationDocuments ,
getServiceDeliveryItemsWithFiles ,
updateServiceDeliverySiterpt3 ,
updateServiceDeliveryPhoto4 ,
updateServiceDeliveryPhoto5 ,
updateOnlineTrackingStatus
} = require("../../../controllers/Market/Transaction/FrmTradeVerifyList");
const router = express.Router();

router.post("/getWardConfigUserList", getWardConfigUserList);
router.post('/getTradeServiceAppStatus', getTradeServiceAppStatus);
router.post('/getTradeServiceADVList', getTradeServiceADVList);
router.post('/getTradeServiceTLCRBList',  getTradeServiceTLCRBList);
router.post("/getTradeServiceList", getTradeServiceList);
router.post("/getTradeServiceDetailsByAppNo", getTradeServiceDetailsByAppNo);
router.post("/getSdItems", getSdItems);
router.post("/getSdItemsWithBlobs", getSdItemsWithBlobs);
router.post("/getMarketLicenseDetailsByLicenseNoAndOrg", getMarketLicenseDetailsByLicenseNoAndOrg);
router.post("/getApplicationDirectors", getApplicationDirectors);
router.post("/getTradeNameDetails", getTradeNameDetails);
router.post("/getTradeNamePhotoDetails", getTradeNamePhotoDetails);
router.post("/getTradeAddressDetails", getTradeAddressDetails);
router.post("/getTradeBusinessDetails", getTradeBusinessDetails);
router.post("/getShopTypeByAppliId", getShopTypeByAppliId);
router.post("/getTradeAuthDate", getTradeAuthDate);
router.post("/getOldDataHistory", getOldDataHistory);
router.post("/getTradeTypeDetails", getTradeTypeDetails);
router.post("/getTradeDirectorDetails", getTradeDirectorDetails);
router.post("/getTradeNameDetailsWithPhoto", getTradeNameDetailsWithPhoto);
router.post("/getServiceDocumentsWithImages", getServiceDocumentsWithImages);
router.post("/getApplicationDocuments", getApplicationDocuments);
router.post("/getServiceDeliveryItemsWithFiles", getServiceDeliveryItemsWithFiles);
router.post("/updateOnlineTrackingStatus", updateOnlineTrackingStatus);


router.put(
    '/updateServiceDeliverySiterpt3', 
    upload.single('BlobDocFile'), // Use upload.single() for a single file upload
    updateServiceDeliverySiterpt3
);


router.put(
    '/updateServiceDeliveryPhoto4', 
    upload.single('BlobDocFile'), // Use upload.single() for a single file upload
    updateServiceDeliveryPhoto4
);


router.put(
    '/updateServiceDeliveryPhoto5', // A distinct endpoint name
    upload.single('BlobDocFile'), 
    updateServiceDeliveryPhoto5
);

module.exports = router;