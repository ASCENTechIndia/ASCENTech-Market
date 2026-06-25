import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import Table from "../../../Components/Table/Table";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
// Assuming you have these components/utilities
import PDFGenerate from "../../../Components/PDFButton/downloadPDF"; // Adjust path as needed
import FrmApplicationPrint from "../../../Components/PDFButton/FrmApplicationPrint"; // Assuming this is your component for the application print PDF

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmApplicationReport() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;

  const [prabhagOptions, setPrabhagOptions] = useState([]);
  const [applicationDetails, setApplicationDetails] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [logoUrl, setLogoUrl] = useState(null); // State to store the logo URL

  // Fetch Prabhag (Ward) names and IDs when UlbId is available
  useEffect(() => {
    const fetchPrabhagOptions = async () => {
      if (!UlbId) {
        console.warn("UlbId not available. Cannot fetch ward names.");
        return;
      }
      try {
        const response = await axios.post(
          `${API_BASE_URL}/getWardNamesAndIdsByUlbId`,
          { ulbId: UlbId }
        );
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((ward) => ({
            value: ward.WARDID,
            label: ward.WARDNAME,
          }));
          setPrabhagOptions(options);
        } else {
          setPrabhagOptions([]);
          console.warn("Invalid ward names data:", response.data);
        }
      } catch (err) {
        console.error("Error fetching ward names:", err);
        setPrabhagOptions([]);
      }
    };

    fetchPrabhagOptions();
  }, [UlbId]);

  const handleSearch = async (values) => {
    setLoading(true); // Set loading true when search starts
    console.log("Form submitted with values:", values);

    const formattedFromDate = values.FromDate
      ? format(new Date(values.FromDate), "dd-MM-yyyy")
      : null;
    const formattedToDate = values.ToDate
      ? format(new Date(values.ToDate), "dd-MM-yyyy")
      : null;

    const payload = {
      ulbId: UlbId,
      wardId: values.Prabhag || null,
      shopName: values.ShopName || null,
      panCardNo: values.PanNo || null,
      FromDt: formattedFromDate,
      ToDt: formattedToDate,
    };

    console.log("API Payload:", payload);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/getAppliPrintDetails`,
        payload
      );
      if (response.data && Array.isArray(response.data.data)) {
        setApplicationDetails(response.data.data);
      } else {
        setApplicationDetails([]);
        console.warn("Invalid application details data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      setApplicationDetails([]);
    } finally {
      setLoading(false); // Set loading false after search completes
    }
  };

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
  }, [UlbId, fetchLogo]); // Add fetchLogo to dependency array for useCallback

  const handleDownloadPDF = async (ID, APPLICATIONNO) => {
    debugger; // Good for debugging
    setLoading(true);
    try {
      // Use Promise.all to make all three API calls concurrently
      const [appDetailsResponse, tradeTypesResponse, imagesResponse] =
        await Promise.all([
          axios.post(`${API_BASE_URL}/getAppliPrintDetailsById`, {
            id: ID,
            applino: APPLICATIONNO,
            ulbId: UlbId,
          }),
          axios.post(`${API_BASE_URL}/applicant-trade-types`, {
            appliId: ID, // Use ID as appliId
            ulbId: UlbId,
          }),
          axios.post(`${API_BASE_URL}/getImages`, {
            // New API call for images
            appliId: ID,
          }),
        ]);

      // Check if all responses were successful and contain data
      if (
        appDetailsResponse.data &&
        appDetailsResponse.data.data &&
        tradeTypesResponse.data &&
        tradeTypesResponse.data.data &&
        imagesResponse.data // Check for images response data
      ) {
        const appDetails = appDetailsResponse.data.data;
        const applicantTradeTypes = tradeTypesResponse.data.data;
        const imagesData = imagesResponse.data; // Extract images data

        // Fetch logo dynamically for PDF if not already available
        const logo = await fetchLogo();

        // Pass all sets of data to your PDF component
        await PDFGenerate({
          PDFComponent: (props) => (
            <FrmApplicationPrint // Assuming FrmApplicationPrint is your component for PDF
              {...props}
              companyName="भिवंडी-निजामपुर महानगरपालिका, भिवंडी"
              logo={logo}
              applicantTradeTypesData={applicantTradeTypes}
              imagesData={imagesData} // Pass the images data here
            />
          ),
          data: appDetails, // Main detailed data
          fileName: `${APPLICATIONNO}.pdf`, // Use APPLICATIONNO for filename
        });
      } else {
        alert(
          "Missing data to generate PDF for this application. Please ensure all required data is available."
        );
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // More descriptive error message for the user
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
  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्ज प्रिंट अहवाल")}
        />
        <hr />
        <Formik
          initialValues={{
            Prabhag: "",
            ShopName: "",
            PanNo: "",
            FromDate: null,
            ToDate: null,
          }}
          onSubmit={handleSearch}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("प्रभाग")} :`} required />
                  <Field
                    name="Prabhag"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                    options={prabhagOptions}
                    placeholder={translate("Select Prabhag")}
                  />
                  <ErrorMessage
                    name="Prabhag"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("दुकानाचे नांव")} :`} required />
                  <Field
                    name="ShopName"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="ShopName"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("पॅन कार्ड क्र.")} :`} required />
                  <Field
                    name="PanNo"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="PanNo"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पासून")} :`} required />
                  <CalendarIcon
                    selectedDate={values.FromDate}
                    setSelectedDate={(date) => setFieldValue("FromDate", date)}
                    placeholder={translate("DD/MM/YYYY")}
                    autoSelectToday={false} // Changed to boolean false
                    className="form-control"
                  />
                  <ErrorMessage
                    name="FromDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पर्यंत")} :`} required />
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
                <SaveButton type="submit" text={translate("शोधा")} />
              </div>
            </Form>
          )}
        </Formik>

        {applicationDetails.length > 0 && (
          <div className="table-container mt-4">
            <div className="table-Box">
              <Table
                headers={[
                  translate("Sr No"),

                  translate("Shop Name"),
                  translate("Pan Card No"),
                  translate("Mobile No"),
                  translate("Email"),

                  translate("Action"),
                ]}
                data={applicationDetails.map((app, index) => ({
                  "Sr No": index + 1,

                  "Shop Name": app.SHOPNAME,
                  "Pan Card No": app.PANCARDNO,
                  "Mobile No": app.CONTACTNO,
                  Email: app.EMAIL,

                  Action: (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={
                        () => handleDownloadPDF(app.ID, app.APPLICATIONNO) // Pass ID and APPLICATIONNO
                      }
                    >
                      छापा
                    </button>
                  ),
                }))}
                keyMapping={{
                  [translate("Sr No")]: "Sr No",

                  [translate("Shop Name")]: "Shop Name",
                  [translate("Pan Card No")]: "Pan Card No",
                  [translate("Mobile No")]: "Mobile No",
                  [translate("Email")]: "Email",

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

export default FrmApplicationReport;
