import { useState, useEffect, useCallback } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon"; // Assuming this is your date picker
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { useAuth } from "../../../Context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import PDFGenerate from "../../../Components/PDFButton/downloadPDF";
import FrmLicencesRegister from "../../../Components/PDFButton/FrmLicencesRegister";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmLicenceRegister() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;

  const [prabhagOptions, setPrabhagOptions] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [logoUrl, setLogoUrl] = useState(null); // State to store the logo URL

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

  // Utility function to format dates to DD-MM-YYYY
  const formatDate = (date) => {
    if (!date) return ""; // Handle null or undefined dates gracefully

    // Ensure it's a Date object. If `date` is already a Date object, this is safe.
    // If it's a string, it attempts to parse it. If it's invalid, it becomes "Invalid Date".
    const localDate = new Date(date);

    // Check if the date is valid after potential parsing
    if (isNaN(localDate.getTime())) {
      console.warn("Invalid date provided for formatting:", date);
      return ""; // Return empty string for invalid dates
    }

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Month is 0-based
    const day = String(localDate.getDate()).padStart(2, "0");

    return `${day}-${month}-${year}`;
  };

  const fetchLogo = useCallback(async () => {
    if (!UlbId) return null; // Return null if UlbId is not available
    try {
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

  const handleDownloadPDF = async (values) => {
    // debugger; // Keep for debugging if needed
    setLoading(true);
    try {
      // debugger; // Keep for debugging if needed

      const payload = {
        ulbId: UlbId,
        FromDt: formatDate(values.FromDate),
        ToDt: formatDate(values.ToDate),
        zoneId: values.Prabhag,
      };

      const response = await axios.post(
        `${API_BASE_URL}/FrmLicenceRegister`, // Your API endpoint for the report
        payload
      );

      if (response.data && Array.isArray(response.data.data)) {
        const reportData = response.data.data;

        const logo = await fetchLogo();
        await PDFGenerate({
          PDFComponent: (props) => (
            <FrmLicencesRegister
              {...props}
              companyName="भिवंडी-निजामपुर महानगरपालिका, भिवंडी" // Or dynamic company name
              logo={logo}
              FromDt={formatDate(values.FromDate)}
              ToDt={formatDate(values.ToDate)}
              Prabhag={values.Prabhag}
            />
          ),
          data: reportData,
          fileName: `LicenceRegisterReport_${formatDate(
            values.FromDate
          )}_${formatDate(values.ToDate)}.pdf`,
        });
      } else {
        alert(translate("अहवाल तयार करण्यासाठी कोणताही डेटा आढळला नाही."));
      }
    } catch (error) {
      console.error("Error generating report:", error);
      alert(
        `${translate("अहवाल तयार करताना त्रुटी आली")}: ${
          error.response?.data?.message ||
          error.message ||
          translate("एक अज्ञात त्रुटी आली.")
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
          text={translate("परवाना नोंदणी अहवाल")}
        />
        <hr />

        <Formik
          initialValues={{
            Prabhag: "",
            FromDate: new Date(), // Initialize with current date for better UX
            ToDate: new Date(), // Initialize with current date for better UX
          }}
          onSubmit={handleDownloadPDF} // Formik handles submission
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
                  />
                  <ErrorMessage
                    name="Prabhag"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पासून")} :`} required />
                  <CalendarIcon
                    selectedDate={values.FromDate} // Pass the Date object from Formik state
                    setSelectedDate={(date) => setFieldValue("FromDate", date)} // CalendarIcon must return a Date object
                    placeholder={translate("DD/MM/YYYY")}
                    autoSelectToday={false} // Keep false if you're explicitly setting selectedDate via `initialValues`
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
                    selectedDate={values.ToDate} // Pass the Date object from Formik state
                    setSelectedDate={(date) => setFieldValue("ToDate", date)} // CalendarIcon must return a Date object
                    placeholder={translate("DD/MM/YYYY")}
                    className="form-control"
                    autoSelectToday={false} // Keep false
                  />
                  <ErrorMessage
                    name="ToDate"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="d-flex justify-content-center gap-2 mt-4">
                <SaveButton
                  type="submit" // Triggers Formik's onSubmit
                  text={translate("शोधा")}
                />
                <SaveButton type="button" text={translate("बंद ")} />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmLicenceRegister;
