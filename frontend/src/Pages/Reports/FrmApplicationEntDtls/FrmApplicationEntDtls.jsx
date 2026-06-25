import React, { useEffect, useState, useCallback } from "react";
import axios from "axios"; // Make sure axios is imported
import moment from "moment"; // Make sure moment is imported for date formatting
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Table from "../../../Components/Table/Table";
import { useAuth } from "../../../Context/AuthContext";

import PDFGenerate from "../../../Components/PDFButton/downloadPDF"; // e.g., a utility function for PDF generation
import FrmApplicationEntDtl from "../../../Components/PDFButton/FrmApplicationEntDtls"; // Your PDF component

// Define your API base URL and ULB ID
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmApplicationEntDtls() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;

  const [applicationData, setApplicationData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null); // State to store the logo URL

  const fetchLogo = useCallback(async () => {
    if (!UlbId) return null; // Return null if UlbId is not available
    try {
      // Corrected endpoint based on typical naming conventions and usage for a single logo
      const response = await axios.get(`${API_BASE_URL}/textlogo/${UlbId}`);
      if (response.data.success) {
        const { ULBLOGO } = response.data.data;
        setLogoUrl(ULBLOGO);
        return ULBLOGO;
      }
    } catch (error) {
      console.error("Error fetching logo and text:", error);
    }
    return null;
  }, [UlbId]);

  useEffect(() => {
    fetchLogo();
  }, [UlbId, fetchLogo]);
  const handleDownloadPDF = async (APPID, APPLINO) => {
    debugger;
    setLoading(true);
    try {
      // Define payloads for the API calls
      const payloadFullDetails = {
        ulbId: UlbId, // Assuming UlbId is available in scope
        applicationNo: APPLINO,
        appId: APPID,
      };

      const payloadTradeRates = {
        ulbId: UlbId, // Assuming UlbId is available in scope
        appId: APPID,
      };

      const payloadApplicationTrades = {
        appId: APPID,
      };

      // Payload for the new /getDirectorDetailsWithAppliTypeUlb API
      const payloadDirectorDetails = {
        appId: APPID,
        ulbId: UlbId, // Assuming UlbId is available in scope
      };

      // Define promises for all four API calls
      const fullAppDetailsPromise = axios.post(
        `${API_BASE_URL}/getFullApplicationDetails`,
        payloadFullDetails
      );

      const tradeTypeRatesPromise = axios.post(
        `${API_BASE_URL}/getTradeTypeRatesForApplication`,
        payloadTradeRates
      );

      const applicationTradesPromise = axios.post(
        `${API_BASE_URL}/getApplicationTrades`,
        payloadApplicationTrades
      );

      const directorDetailsPromise = axios.post(
        `${API_BASE_URL}/getDirectorDetailsWithAppliTypeUlb`,
        payloadDirectorDetails
      );

      // Use Promise.all to await all promises concurrently
      const [
        responseFullDetails,
        responseTradeRates,
        responseApplicationTrades,
        responseDirectorDetails, // New: Response for director details
      ] = await Promise.all([
        fullAppDetailsPromise,
        tradeTypeRatesPromise,
        applicationTradesPromise,
        directorDetailsPromise, // New: Include director details promise
      ]);

      let fullAppDetails = null;
      if (responseFullDetails.data && responseFullDetails.data.data) {
        fullAppDetails = responseFullDetails.data.data;
      } else {
        alert(
          "No full application details found for this application to generate PDF."
        );
        setLoading(false);
        return;
      }

      let tradeTypeRatesData = [];
      if (responseTradeRates.data && responseTradeRates.data.data) {
        tradeTypeRatesData = responseTradeRates.data.data;
      } else {
        console.warn("No trade type rates found for this application.");
      }

      let applicationTradesData = [];
      if (
        responseApplicationTrades.data &&
        responseApplicationTrades.data.data
      ) {
        applicationTradesData = responseApplicationTrades.data.data;
      } else {
        console.warn("No application trades found for this application.");
      }

      let directorDetailsData = []; // Initialize as an empty array
      if (responseDirectorDetails.data && responseDirectorDetails.data.data) {
        directorDetailsData = responseDirectorDetails.data.data; // Assign the data array
      } else {
        console.warn("No director details found for this application.");
      }

      // Fetch logo dynamically for PDF if not already available
      const logo = await fetchLogo(); // Assuming fetchLogo is defined elsewhere in your component

      // Pass all gathered data to your PDF component
      await PDFGenerate({
        PDFComponent: (props) => (
          <FrmApplicationEntDtl // Assuming FrmApplicationEntDtl is your component for PDF
            {...props}
            companyName="भिवंडी-निजामपुर महानगरपालिका, भिवंडी"
            logo={logo}
            tradeTypeRates={tradeTypeRatesData}
            applicationTrades={applicationTradesData}
            directorDetails={directorDetailsData}
          />
        ),

        data: fullAppDetails, // Also pass to PDFGenerate utility if it needs it directly
        fileName: `${APPLINO}.pdf`, // Use APPLICATIONNO for filename
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(
        `Error generating PDF: ${
          error.response?.data?.message ||
          error.message ||
          "An unknown error occurred."
        }`
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (values) => {
    setLoading(true);
    setApplicationData([]); // Clear previous data before new search

    try {
      const formattedFromDate = values.FromDate
        ? moment(values.FromDate).format("DD-MM-YYYY")
        : null;
      const formattedToDate = values.ToDate
        ? moment(values.ToDate).format("DD-MM-YYYY")
        : null;

      const payload = {
        ulbId: UlbId,
        FromDt: formattedFromDate,
        ToDt: formattedToDate,
        applicationNo: values.FormNo || null,
      };

      const response = await axios.post(
        `${API_BASE_URL}/getApplicationDetailsByNoAndDate`,
        payload
      );

      if (response.data && response.data.data) {
        setApplicationData(response.data.data); // Update state with fetched data
      } else {
        setApplicationData([]);
        alert("No application details found for the given criteria.");
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      alert(
        `Error fetching data: ${
          error.response?.data?.message ||
          error.message ||
          "An unknown error occurred."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्ज नोंदी तपशील अहवाल")} // "Application Registration Details Report"
        />
        <hr />

        <Formik
          initialValues={{
            FormNo: "",
            FromDate: "",
            ToDate: "",
          }}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("अर्ज क्र.")} :`} />{" "}
                  {/* "Application No." */}
                  <Field
                    name="FormNo"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="FormNo"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पासून")} :`} />{" "}
                  {/* "From Date" */}
                  <CalendarIcon
                    selectedDate={values.FromDate}
                    setSelectedDate={(date) => setFieldValue("FromDate", date)}
                    placeholder={translate("DD/MM/YYYY")}
                    autoSelectToday="true"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="FromDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पर्यंत")} :`} />{" "}
                  {/* "To Date" */}
                  <CalendarIcon
                    selectedDate={values.ToDate}
                    setSelectedDate={(date) => setFieldValue("ToDate", date)}
                    placeholder={translate("DD/MM/YYYY")}
                    className="form-control"
                    autoSelectToday={false} // Changed to boolean false
                  />
                  <ErrorMessage
                    name="ToDate"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton type="submit" text={translate("शोधा")} />{" "}
                {/* "Search" */}
              </div>
            </Form>
          )}
        </Formik>
        {applicationData.length > 0 && (
          <div className="table-container mt-4">
            <div className="table-Box">
              <Table
                headers={[
                  translate("Sr No"),
                  translate("Application No."), // Added Application No. based on the image
                  translate("Shop Name"),
                  translate("Application Date"),
                  translate("Address"),
                  translate("Amount"),
                  translate("Action"),
                ]}
                data={applicationData.map((app, index) => ({
                  "Sr No": index + 1,
                  "Application No.": app.APPLINO, // Map APPLINO to Application No.
                  "Shop Name": app.SHOPNAME,
                  "Application Date": app.APPLIDT || "N/A", // Assuming PANCARDNO exists or 'N/A'
                  Address: <div className="wrap-text">{app.ADDRESS}</div>, // Assuming CONTACTNO exists or 'N/A'
                  Amount: app.AMOUNT || "N/A", // Assuming EMAIL exists or 'N/A'
                  Action: (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleDownloadPDF(app.APPID, app.APPLINO)} // Use APPID and APPLINO
                      disabled={loading} // Disable print button while loading
                    >
                      Print
                    </button>
                  ),
                }))}
                keyMapping={{
                  [translate("Sr No")]: "Sr No",
                  [translate("Application No.")]: "Application No.",
                  [translate("Shop Name")]: "Shop Name",
                  [translate("Application Date")]: "Application Date", // Corrected
                  [translate("Address")]: "Address", // Corrected
                  [translate("Amount")]: "Amount", // Corrected
                  [translate("Action")]: "Action",
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmApplicationEntDtls;
