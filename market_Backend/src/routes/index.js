const express = require("express");
const router = express.Router();

const authRoutes = require("./Admin/authRoutes");
router.use("/", authRoutes);

const logoroutes = require("./Admin/logoroutes");
router.use("/", logoroutes);

const logoutRoutes = require("./Admin/logoutRoutes.js");
router.use("/", logoutRoutes);

const menurouted = require("./Admin/menuRoutes.js");
router.use("/", menurouted);

//MASTERS

const ParentMenuDropdown = require("./Market/Masters/ParentMenuDropdown");
router.use("/", ParentMenuDropdown);

const CorporationDropdown = require("./Market/Masters/CorporationDropdown");
router.use("/", CorporationDropdown);

const UserLevelData = require("./Market/Masters/UserLevelData");
router.use("/", UserLevelData);

const FrmMenuMst = require("./Market/Masters/FrmMenuMst");
router.use("/", FrmMenuMst);

const MenuCorporationList = require("./Market/Masters/MenuCorporationList");
router.use("/", MenuCorporationList);

const MenuDesignationId = require("./Market/Masters/MenuDesignationId");
router.use("/", MenuDesignationId);

const getUsersByCorporationId = require("./Market/Masters/getUsersByCorporationId");
router.use("/", getUsersByCorporationId);

const Aomk_Trade_Ins = require("./Market/Masters/Aomk_Trade_Ins");
router.use("/", Aomk_Trade_Ins);

const FrmTradeTypeList = require("./Market/Masters/FrmTradeTypeList");
router.use("/", FrmTradeTypeList);

const Aomk_TradeType_Ins = require("./Market/Masters/Aomk_TradeType_Ins");
router.use("/", Aomk_TradeType_Ins);

const FrmDocumentMasterList = require("./Market/Masters/FrmDocumentMasterList");
router.use("/", FrmDocumentMasterList);


const FrmUserList = require("./Market/Masters/FrmUserList");
router.use("/", FrmUserList);

const Aomk_Applitype_Ins = require("./Market/Masters/Aomk_Applitype_Ins");
router.use("/", Aomk_Applitype_Ins);

const FrmTradeCategoryMst = require("./Market/Masters/FrmTradeCategoryMst");
router.use("/", FrmTradeCategoryMst);

const FrmUlbTipMst = require("./Market/Masters/FrmUlbTipMst");
router.use("/", FrmUlbTipMst);

const FrmServiceMapMst = require("./Market/Masters/FrmServiceMapMst");
router.use("/", FrmServiceMapMst);

const FrmTradeCategoryConfig = require("./Market/Masters/FrmTradeCategoryConfig");
router.use("/", FrmTradeCategoryConfig);

const getConfiguredTradeCategories = require("./Market/Masters/getConfiguredTradeCategories");
router.use("/", getConfiguredTradeCategories);

//Report Pages
const getDistinctWardNamesAndId = require("./Market/Reports/getDistinctWardNamesAndId");
router.use("/", getDistinctWardNamesAndId);

const FrmApplicationListReport = require("./Market/Reports/FrmApplicationListReport");
router.use("/", FrmApplicationListReport);

const getRecModeConfig = require("./Market/Reports/getRecModeConfig");
router.use("/", getRecModeConfig);

const getFinancialYears = require("./Market/Reports/getFinancialYears");
router.use("/", getFinancialYears);

const getChallanReport = require("./Market/Reports/getChallanReport");
router.use("/", getChallanReport);

const getRejectedApplications = require("./Market/Reports/getRejectedApplications");
router.use("/", getRejectedApplications);

const FrmDailyCollRpt = require("./Market/Reports/FrmDailyCollRpt");
router.use("/", FrmDailyCollRpt);

const getApplicationDetailsByNoAndDate = require("./Market/Reports/getApplicationDetailsByNoAndDate");
router.use("/", getApplicationDetailsByNoAndDate);

const getFullApplicationDetails = require("./Market/Reports/getFullApplicationDetails");
router.use("/", getFullApplicationDetails);

const getTradeTypeRatesForApplication = require("./Market/Reports/getTradeTypeRatesForApplication");
router.use("/", getTradeTypeRatesForApplication);

const getApplicationTrades = require("./Market/Reports/getApplicationTrades");
router.use("/", getApplicationTrades);

const getDirectorDetailsWithAppliTypeUlb = require("./Market/Reports/getDirectorDetailsWithAppliTypeUlb");
router.use("/", getDirectorDetailsWithAppliTypeUlb);

const FrmLicenceRegister = require("./Market/Reports/FrmLicenceRegister");
router.use("/", FrmLicenceRegister);

const GetTradetypes = require("./Market/Reports/GetTradetypes.js");
router.use("/", GetTradetypes);

const GetImageforreports = require("./Market/Reports/GetImageforreports.js");
router.use("/", GetImageforreports);

const FrmErrorLogRpt = require("./Market/Reports/FrmErrorLogRpt");
router.use("/", FrmErrorLogRpt);

const FrmActivityLogRpt = require("./Market/Reports/FrmActivityLogRpt");
router.use("/", FrmActivityLogRpt);

const FrmPrintMarketReports = require("./Market/Reports/FrmPrintMarketReports");
router.use("/", FrmPrintMarketReports);

const FrmPrintSankshil = require("./Market/Reports/FrmPrintSankshil");
router.use("/", FrmPrintSankshil);

const FrmPrintTapshil = require("./Market/Reports/FrmPrintTapshil");
router.use("/", FrmPrintTapshil);

const getFilteredReceiptDetails = require("./Market/Reports/getFilteredReceiptDetails");
router.use("/", getFilteredReceiptDetails);

const getGenReceiptChallan = require("./Market/Reports/getGenReceiptChallan");
router.use("/", getGenReceiptChallan);

const getFilteredGeneralReceipts = require("./Market/Reports/getFilteredGeneralReceipts");
router.use("/", getFilteredGeneralReceipts);

const getFilteredChallanDetails = require("./Market/Reports/getFilteredChallanDetails");
router.use("/", getFilteredChallanDetails);

const getDigiCertDetails = require("./Market/Reports/getDigiCertDetails");
router.use("/", getDigiCertDetails);

const getCertificateGenReport = require("./Market/Reports/getCertificateGenReport");
router.use("/", getCertificateGenReport);

const getShopTypeByAppAndOrgId = require("./Market/Reports/getShopTypeByAppAndOrgId");
router.use("/", getShopTypeByAppAndOrgId);

const getMarketLicenseDetailsByLicenseNo = require("./Market/Reports/getMarketLicenseDetailsByLicenseNo");
router.use("/", getMarketLicenseDetailsByLicenseNo);

const FrmTradeGenericSearch = require("./Market/Reports/FrmTradeGenericSearch");
router.use("/", FrmTradeGenericSearch);

const FrmReceiptReprint = require("./Market/Reports/FrmReceiptReprint");
router.use("/", FrmReceiptReprint);

const FinalFrmReceiptReprint = require("./Market/Reports/FinalFrmReceiptReprint");
router.use("/", FinalFrmReceiptReprint);

//Transaction Pages

const FrmLicenseEntryList = require("./Market/Transaction/FrmLicenseEntryList");
router.use("/", FrmLicenseEntryList);

const getWardId = require("./Market/Transaction/getWardId");
router.use("/", getWardId);

const getYearList = require("./Market/Transaction/getYearList");
router.use("/", getYearList);

const getTradeTypes = require("./Market/Transaction/getTradeTypes");
router.use("/", getTradeTypes);

const getDocumentTypes = require("./Market/Transaction/getDocumentTypes");
router.use("/", getDocumentTypes);

const getMarketLicenseDetails = require("./Market/Transaction/getMarketLicenseDetails");
router.use("/", getMarketLicenseDetails);

const getApplicationTradeID = require("./Market/Transaction/getApplicationTradeID");
router.use("/", getApplicationTradeID);

const getDirectorDetailsByAppliId = require("./Market/Transaction/getDirectorDetailsByAppliId");
router.use("/", getDirectorDetailsByAppliId);

const getDocumentDetails = require("./Market/Transaction/getDocumentDetails");
router.use("/", getDocumentDetails);

const getArrearsDetails = require("./Market/Transaction/getArrearsDetails");
router.use("/", getArrearsDetails);

const getTradeTypeRatesFrmDate = require("./Market/Transaction/getTradeTypeRatesFrmDate");
router.use("/", getTradeTypeRatesFrmDate);

const getTradeTypeRatesByCategory = require("./Market/Transaction/getTradeTypeRatesByCategory");
router.use("/", getTradeTypeRatesByCategory);

const getCorporationCode = require("./Market/Transaction/getCorporationCode");
router.use("/", getCorporationCode);

const FrmApplicationEntryList = require("./Market/Transaction/FrmApplicationEntryList");
router.use("/", FrmApplicationEntryList);

const getTradeTypesWithFlag = require("./Market/Transaction/getTradeTypesWithFlag");
router.use("/", getTradeTypesWithFlag);

const getDocumentTypesByUlbId = require("./Market/Transaction/getDocumentTypesByUlbId");
router.use("/", getDocumentTypesByUlbId);

const FrmApplicationEntryMst = require("./Market/Transaction/FrmApplicationEntryMst");
router.use("/", FrmApplicationEntryMst);

const getDocumentDetailsWithAppliUlbId = require("./Market/Transaction/getDocumentDetailsWithAppliUlbId");
router.use("/", getDocumentDetailsWithAppliUlbId);

const getTradeServiceCount = require("./Market/Transaction/getTradeServiceCount");
router.use("/", getTradeServiceCount);

const getTradeRatesFromDate = require("./Market/Transaction/getTradeRatesFromDate");
router.use("/", getTradeRatesFromDate);

const getReceiptDetails = require("./Market/Transaction/getReceiptDetails");
router.use("/", getReceiptDetails);

const updateDirectorPhoto = require("./Market/Transaction/updateDirectorPhoto");
router.use("/", updateDirectorPhoto);

const insertApplicationDocument = require("./Market/Transaction/insertApplicationDocument");
router.use("/", insertApplicationDocument);

const BindApplicationADTPD = require("./Market/Transaction/BindApplicationADTPD");
router.use("/", BindApplicationADTPD);

const getApplicationsByStatusAndType = require("./Market/Transaction/getApplicationsByStatusAndType");
router.use("/", getApplicationsByStatusAndType);

const getDetailedApplicationInfo = require("./Market/Transaction/getDetailedApplicationInfo");
router.use("/", getDetailedApplicationInfo);

const FrmAppliVerificationMst = require("./Market/Transaction/FrmAppliVerificationMst");
router.use("/", FrmAppliVerificationMst);

const getAdditionalItems = require("./Market/Transaction/getAdditionalItems");
router.use("/", getAdditionalItems);

const getStandardItems = require("./Market/Transaction/getStandardItems");
router.use("/", getStandardItems);

const FrmApplicationEntryAuthList = require("./Market/Transaction/FrmApplicationEntryAuthList");
router.use("/", FrmApplicationEntryAuthList);

const FrmCollectionList = require("./Market/Transaction/FrmCollectionList");
router.use("/", FrmCollectionList);

const getLatestReceiptId = require("./Market/Transaction/getLatestReceiptId");
router.use("/", getLatestReceiptId);

const getMarketLicenseBillingDetails = require("./Market/Transaction/getMarketLicenseBillingDetails");
router.use("/", getMarketLicenseBillingDetails);

const getCollectionDetails = require("./Market/Transaction/getCollectionDetails");
router.use("/", getCollectionDetails);

const aomk_appli_auth_ins = require("./Market/Transaction/aomk_appli_auth_ins");
router.use("/", aomk_appli_auth_ins);

const DeleteDocument = require("./Market/Transaction/DeleteDocument.js");
router.use("/", DeleteDocument);

const BindApplicationDtlsForGenerateCerti = require("./Market/Transaction/BindApplicationDtlsForGenerateCerti");
router.use("/", BindApplicationDtlsForGenerateCerti);

const getUserDigiCertKey = require("./Market/Transaction/getUserDigiCertKey");
router.use("/", getUserDigiCertKey);

const getCertificateFrmView = require("./Market/Transaction/getCertificateFrmView");
router.use("/", getCertificateFrmView);

const getLicenseDetailswithType = require("./Market/Transaction/getLicenseDetailswithType");
router.use("/", getLicenseDetailswithType);

const getCertificateFromAppliMas = require("./Market/Transaction/getCertificateFromAppliMas");
router.use("/", getCertificateFromAppliMas);

const fetchBankNames = require("./Market/Transaction/fetchBankNames");
router.use("/", fetchBankNames);

const aomk_receptcollection_ins = require("./Market/Transaction/aomk_receptcollection_ins");
router.use("/", aomk_receptcollection_ins);

const PrintCollectionReceipt = require("./Market/Transaction/PrintCollectionReceipt");
router.use("/", PrintCollectionReceipt);

const getZonesByUlb = require("./Market/Transaction/getZonesByUlb.js");
router.use("/", getZonesByUlb);

const GenerateCertificate = require("./Market/Transaction/GenerateCertificate");
router.use("/", GenerateCertificate);

//Homepage
const MarketDashboardData = require("./Market/HomePage/MarketDashboardData.js");
router.use("/", MarketDashboardData);

const MarketDashboardDataByMonth = require("./Market/HomePage/MarketDashboardDataByMonth");
router.use("/", MarketDashboardDataByMonth);

const MarketDashboardDataByYear = require("./Market/HomePage/MarketDashboardDataByYear");
router.use("/", MarketDashboardDataByYear);

const getDailyMarketDashboardData = require("./Market/HomePage/getDailyMarketDashboardData");
router.use("/", getDailyMarketDashboardData);

const DailyMarketDashboardDataGroupedByMonth = require("./Market/HomePage/DailyMarketDashboardDataGroupedByMonth.js");
router.use("/", DailyMarketDashboardDataGroupedByMonth);

const aomk_genrct_chalannumber_gen = require("./Market/Transaction/aomk_genrct_chalannumber_gen");
router.use("/", aomk_genrct_chalannumber_gen);

const aomk_AppliVerify_ins = require("./Market/Transaction/aomk_AppliVerify_ins");
router.use("/", aomk_AppliVerify_ins);

const getWardsByZone = require("./Market/Transaction/getWardsByZone.js");
router.use("/", getWardsByZone);

const FrmSiteVisit = require("./Market/Transaction/FrmSiteVisit.js");
router.use("/", FrmSiteVisit);

module.exports = router;
