import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./HOC/ProtectedRoute"; // Ensure this path is correct
import useDynamicFavicon from "./Hooks/useDynamicFavicon";

import Dashboard from "./Pages/DashBoard/DashBord";
import Login from "./HOC/Login/Login";
import FrmMenuList from "./Pages/Master/FrmMenuList/FrmMenuList";
import FrmMenuMst from "./Pages/Master/FrmMenuMst/FrmMenuMst";
import FrmUserAccessList from "./Pages/Master/FrmUserAccessList/FrmUserAccessList";
import FrmTradeList from "./Pages/Master/FrmTradeList/FrmTradeList";
import FrmTradeMst from "./Pages/Master/FrmTradeMst/FrmTradeMst";
import FrmTradeTypeList from "./Pages/Master/FrmTradeTypeList/FrmTradeTypeList";
import FrmTradeTypeMst from "./Pages/Master/FrmTradeTypeMst/FrmTradeTypeMst";
import FrmApplicantTypeList from "./Pages/Master/FrmApplicantTypeList/FrmApplicantTypeList.JSX";
import FrmApplicantTypeMst from "./Pages/Master/FrmApplicantTypeMst/FrmApplicantTypeMst";
import FrmDocumentMasterList from "./Pages/Master/FrmDocumentMasterList/FrmDocumentMasterList";
import FrmDocumentMasterMst from "./Pages/Master/FrmDocumentMasterMst/FrmDocumentMasterMst";
import FrmUserList from "./Pages/Master/FrmUserList/FrmUserList.JSX";
import FrmUserMst from "./Pages/Master/FrmUserMst/FrmUserMst";
import FrmTradeCategoryList from "./Pages/Master/FrmTradeCategoryList/FrmTradeCategoryList";
import FrmTradeCategoryMst from "./Pages/Master/FrmTradeCategoryMst/FrmTradeCategoryMst";
import FrmUlbTipList from "./Pages/Master/FrmUlbTipList/FrmUlbTipList";
import FrmUlbTipMst from "./Pages/Master/FrmUlbTipMst/FrmUlbTipMst";
import FrmServiceMapList from "./Pages/Master/FrmServiceMapList/FrmServiceMapList";
import FrmServiceMapMst from "./Pages/Master/FrmServiceMapMst/FrmServiceMapMst";
//Report
import FrmApplicationListReport from "./Pages/Reports/FrmApplicationListReport/FrmApplicationListReport";
import FrmChallanReport from "./Pages/Reports/FrmChallanReport/FrmChallanReport";
import FrmApplicationReport from "./Pages/Reports/FrmApplicationReport/FrmApplicationReport";
import FrmRejectApplicationReport from "./Pages/Reports/FrmRejectApplicationReport/FrmRejectApplicationReport";
import FrmDailyCollRpt from "./Pages/Reports/FrmDailyCollRpt/FrmDailyCollRpt";
import FrmApplicationEntDtls from "./Pages/Reports/FrmApplicationEntDtls/FrmApplicationEntDtls";
import FrmLicenceRegister from "./Pages/Reports/FrmLicenceRegister/FrmLicenceRegister";
import FrmErrorLogRpt from "./Pages/Reports/FrmErrorLogRpt/FrmErrorLogRpt";
import FrmActivityLogRpt from "./Pages/Reports/FrmActivityLogRpt/FrmActivityLogRpt";
import FrmPrintMarketReports from "./Pages/Reports/FrmPrintMarketReports/FrmPrintMarketReports";
import FrmGeneralReceiptChallan from "./Pages/Reports/FrmGeneralReceiptChallan/FrmGeneralReceiptChallan";
import FrmCertiRePrint from "./Pages/Reports/FrmCertiRePrint/FrmCertiRePrint";
//Search
import FrmTradeGenericSearch from "./Pages/Search/FrmTradeGenericSearch/FrmTradeGenericSearch";
import FrmReceiptReprint from "./Pages/Search/FrmReceiptReprint/FrmReceiptReprint";
//Configuration
import FrmTradeCategoryConfig from "./Pages/Configuration/FrmTradeCategoryConfig/FrmTradeCategoryConfig";
//Transaction
import FrmLicenseEntryList from "./Pages/Transactions/FrmLicenseEntryList/FrmLicenseEntryList";
import FrmLicenseEntry from "./Pages/Transactions/FrmLicenseEntry/FrmLicenseEntry";
import FrmApplicationEntryList from "./Pages/Transactions/FrmApplicationEntryList/FrmApplicationEntryList";
import FrmApplicationEntryMst from "./Pages/Transactions/FrmApplicationEntryMst/FrmApplicationEntryMst";
import FrmAppliVerificationList from "./Pages/Transactions/FrmAppliVerificationList/FrmAppliVerificationList";
import FrmAppliVerificationMst from "./Pages/Transactions/FrmAppliVerificationMst/FrmAppliVerificationMst";
import FrmApplicationEntryAuthList from "./Pages/Transactions/FrmApplicationEntryAuthList/FrmApplicationEntryAuthList";
import FrmApplicationEntryAuthMst from "./Pages/Transactions/FrmApplicationEntryAuthMst/FrmApplicationEntryAuthMst";
import FrmCollectionList from "./Pages/Transactions/FrmCollectionList/FrmCollectionList";
import FrmGenerateCertificateList from "./Pages/Transactions/FrmGenerateCertificateList/FrmGenerateCertificateList";
import FrmGenerateCertificateMst from "./Pages/Transactions/FrmGenerateCertificateMst/FrmGenerateCertificateMst";
import FrmGeneralReceiptChallanGen from "./Pages/Transactions/FrmGeneralReceiptChallanGen/FrmGeneralReceiptChallanGen";
import FrmCollection from "./Pages/Transactions/FrmCollection/FrmCollection";
import FrmBillGeneration from "./Pages/Transactions/FrmBillGeneration/FrmBillGeneration";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  //  const ulbId = localStorage.getItem("ulbId"); // or from context/state
  useDynamicFavicon();
  const protectedRoutes = [
    ["/HomePage/Dashboard.aspx", <Dashboard />],

    // MASTERS
    ["/Masters/FrmMenuList.aspx", <FrmMenuList />],
    ["/Masters/FrmMenuMst.aspx", <FrmMenuMst />],
    ["/Masters/FrmUserAccessList.aspx", <FrmUserAccessList />],
    ["/Masters/FrmTradeList.aspx", <FrmTradeList />],
    ["/Masters/FrmTradeMst.aspx", <FrmTradeMst />],
    ["/Masters/FrmTradeTypeList.aspx", <FrmTradeTypeList />],
    ["/Masters/FrmTradeTypeMst.aspx", <FrmTradeTypeMst />],
    ["/Masters/FrmApplicantTypeList.aspx", <FrmApplicantTypeList />],
    ["/Masters/FrmApplicantTypeMst.aspx", <FrmApplicantTypeMst />],
    ["/Masters/FrmDocumentMasterList.aspx", <FrmDocumentMasterList />],
    ["/Masters/FrmUserList.aspx", <FrmUserList />],
    ["/Masters/FrmUserMst.aspx", <FrmUserMst />],
    ["/Masters/FrmTradeCategoryList.aspx", <FrmTradeCategoryList />],
    ["/Masters/FrmTradeCategoryMst.aspx", <FrmTradeCategoryMst />],
    ["/Masters/FrmUlbTipList.aspx", <FrmUlbTipList />],
    ["/Masters/FrmUlbTipMst.aspx", <FrmUlbTipMst />],
    ["/Masters/FrmServiceMapList.aspx", <FrmServiceMapList />],
    ["/Masters/FrmServiceMapMst.aspx", <FrmServiceMapMst />],

    //  REPORTS
    [
      "/ReportsForm/FrmApplicationListReport.aspx",
      <FrmApplicationListReport />,
    ],
    ["/ReportsForm/FrmChallanReport.aspx", <FrmChallanReport />],
    ["/ReportsForm/FrmApplicationReport.aspx", <FrmApplicationReport />],
    [
      "/ReportsForm/FrmRejectApplicationReport.aspx",
      <FrmRejectApplicationReport />,
    ],
    ["/ReportsForm/FrmDailyCollRpt.aspx", <FrmDailyCollRpt />],
    ["/ReportsForm/FrmApplicationEntDtls.aspx", <FrmApplicationEntDtls />],

    ["/ReportsForm/FrmLicenceRegister.aspx", <FrmLicenceRegister />],
    ["/Utility/FrmErrorLogRpt.aspx", <FrmErrorLogRpt />],
    ["/Utility/FrmActivityLogRpt.aspx", <FrmActivityLogRpt />],
    ["/ReportsForm/FrmPrintMarketReports.aspx", <FrmPrintMarketReports />],
    [
      "/ReportsForm/FrmGeneralReceiptChallan.aspx",
      <FrmGeneralReceiptChallan />,
    ],
    ["/ReportsForm/FrmReprintCerti.aspx", <FrmCertiRePrint />],
    ["/Transaction/FrmTradeGenericSearch.aspx", <FrmTradeGenericSearch />],
    ["/ReportsForm/FrmReceiptReprint.aspx", <FrmReceiptReprint />],
    ["/Transaction/FrmLicenseEntryList.aspx", <FrmLicenseEntryList />],
    ["/Transaction/FrmLicenseEntry.aspx", <FrmLicenseEntry />],
    ["/Masters/FrmDocumentMasterMst.aspx", <FrmDocumentMasterMst />],
    ["/Masters/FrmTradeCategoryConfig.aspx", <FrmTradeCategoryConfig />],
    // ["/Transaction/FrmApplicationEntryList.aspx", <FrmApplicationEntryList />],
    ["/Transaction/FrmAppliEntryList.aspx", <FrmApplicationEntryList />],
    ["/Transaction/FrmApplicationEntryMst.aspx", <FrmApplicationEntryMst />],
    [
      "/Transaction/FrmAppliVerificationList.aspx",
      <FrmAppliVerificationList />,
    ],
    ["/Transaction/FrmAppliVerificationMst.aspx", <FrmAppliVerificationMst />],
    [
      "/Transaction/FrmApplicationEntryAuthList.aspx",
      <FrmApplicationEntryAuthList />,
    ],
    [
      "/Transaction/FrmApplicationEntryAuthMst.aspx",
      <FrmApplicationEntryAuthMst />,
    ],
    ["/Transaction/FrmCollectionList.aspx", <FrmCollectionList />],
    [
      "/Transaction/FrmGenerateCertificateList.aspx",
      <FrmGenerateCertificateList />,
    ],
    [
      "/Transaction/FrmGenerateCertificateMst.aspx",
      <FrmGenerateCertificateMst />,
    ],
    [
      "/Transaction/FrmGeneralReceiptChallanGen.aspx",
      <FrmGeneralReceiptChallanGen />,
    ],
    ["/Transaction/FrmCollection.aspx", <FrmCollection />],

    ["/Transaction/FrmBillGeneration.aspx", <FrmBillGeneration />],
  ];
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          {protectedRoutes.map(([path, element], index) => (
            <Route
              key={index}
              path={path}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
