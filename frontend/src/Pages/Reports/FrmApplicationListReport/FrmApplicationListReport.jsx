import React, { useEffect, useState, useCallback } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
import PDFGenerate from "../../../Components/PDFButton/downloadPDF"; // Assuming this path is correct
import axios from "axios";
import FrmApplicationListReportPDF from "../../../Components/PDFButton/FrmApplicationListReport";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
function FrmApplicationListReport() {
  const { translate } = useLanguage();
  const { user } = useAuth(); // Get the user object from the AuthContext
  const [FromDate, setFromDate] = useState(null);
  const [ToDate, setToDate] = useState(null);
  const [wardOptions, setWardOptions] = useState([]);
  const [logoUrl, setLogoUrl] = useState(""); // State to store the ULB logo URL
  const [loading, setLoading] = useState(false); // State to manage loading for PDF download

  // Base URL for API calls, consistent with your original code
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchLogo = useCallback(async () => {
    if (!user?.ulbId) return null; // Ensure ulbId is available before fetching
    try {
      const response = await axios.get(
        `${API_BASE_URL}/textlogo/${user.ulbId}`
      );
      if (response.data.success) {
        const { ULBLOGO } = response.data.data;
        setLogoUrl(ULBLOGO); // Update logoUrl state
        return ULBLOGO; // Return the logo URL for immediate use if needed
      }
    } catch (error) {
      console.error("Error fetching logo and text:", error);
    }
    return null;
  }, [user?.ulbId, API_BASE_URL]);

  useEffect(() => {
    // Effect to fetch ward names and logo on component mount or when user changes
    if (user && user.ulbId) {
      const fetchWardNames = async () => {
        try {
          const response = await fetch(
            `${API_BASE_URL}/getWardNamesAndIdsByUlbId`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ulbId: user.ulbId }),
            }
          );
          const result = await response.json();
          if (result.data) {
            const formattedOptions = result.data.map((ward) => ({
              label: ward.WARDNAME, // Display name for dropdown
              value: ward.WARDID, // Value to be selected
            }));
            setWardOptions(formattedOptions);
          }
        } catch (error) {
          console.error("Error fetching ward names:", error);
        }
      };

      fetchWardNames();
      fetchLogo(); // Call fetchLogo when component mounts or user changes
    }
  }, [user, fetchLogo]); // Depend on user and fetchLogo

  const handleGenerateReportPDF = async (values) => {
    setLoading(true); // Set loading to true while fetching data and generating PDF
    try {
      const formattedFromDate = formatDate(values.FromDate);
      const formattedToDate = formatDate(values.ToDate);

      // Make the API call to get the application list data
      const response = await axios.post(
        `${API_BASE_URL}/FrmApplicationListReport`,
        {
          FromDt: formattedFromDate,
          ToDt: formattedToDate,
          OrgId: user?.ulbId || "5", // Use ulbId from user, fallback to "5"
          ZoneId: values.Prabhag, // Use the selected Prabhag (Zone ID)
        }
      );

      if (response.data && response.data.data) {
        const applicationData = response.data.data;
        const logo = await fetchLogo(); // Ensure logo is fetched before PDF generation

        await PDFGenerate({
          PDFComponent: (props) => (
            <FrmApplicationListReportPDF // Use the new PDF component for this report
              {...props}
              companyName="IN USE भिवंडी-निजामपुर महानगरपालिका, भिवंडी" // Example company name
              logo={logo} // Pass the fetched logo
              fromDate={formattedFromDate} // Pass date range for PDF display
              toDate={formattedToDate}
              prabhagId={values.Prabhag}
            />
          ),
          data: applicationData, // Pass ALL fetched application records to the PDF component
          fileName: `ApplicationReport_${formattedFromDate}_to_${formattedToDate}.pdf`,
        });
      } else {
        alert("No data found for the selected criteria to generate PDF.");
      }
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert("Error generating PDF report. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after process completes
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्ज यादी अहवाल")}
        />
        <hr />

        <Formik
          initialValues={{
            Prabhag: "",
            FromDate: "",
            ToDate: "",
          }}
          onSubmit={handleGenerateReportPDF} // Change onSubmit to the new function
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("प्रभाग")} :`} required />
                  <Field
                    name="Prabhag"
                    component={InputField}
                    type="dropdown"
                    options={wardOptions}
                    placeholder={translate("Select Prabhag")}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="Prabhag"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <div className="mb-2">
                    <Label text={`${translate("दिनांका पासून")} :`} required />
                  </div>
                  <CalendarIcon
                    name="FromDate"
                    selectedDate={FromDate}
                    setSelectedDate={(date) => {
                      setFromDate(date);
                      setFieldValue("FromDate", date);
                    }}
                    placeholder={translate("DD/MM/YYYY")}
                  />
                  <ErrorMessage
                    name="FromDate"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <div className="mb-2">
                    <Label text={`${translate("दिनांका पर्यंत")} :`} required />
                  </div>
                  <CalendarIcon
                    name="ToDate"
                    selectedDate={ToDate}
                    setSelectedDate={(date) => {
                      setToDate(date);
                      setFieldValue("ToDate", date);
                    }}
                    placeholder={translate("DD/MM/YYYY")}
                  />
                  <ErrorMessage
                    name="ToDate"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton
                  type="submit"
                  text={translate("शोधा")} // This button will now trigger PDF download
                  disabled={loading}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmApplicationListReport;
