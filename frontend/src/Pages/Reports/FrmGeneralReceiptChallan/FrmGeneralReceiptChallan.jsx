import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import PDFGenerate from "../../../Components/PDFButton/downloadPDF";
import GenrateChallan from "../../../Components/PDFButton/GenrateChallan";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmGeneralReceiptChallan() {
  const { translate } = useLanguage();
  const [prabhagOptions, setPrabhagOptions] = useState([]);
  const [payModeOptions, setPayModeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const UlbId = user?.ulbId;
  const username = user?.username;
  console.log(username);

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

    const fetchPayModes = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/getRecModeConfig`, {
          ulbId: UlbId,
        });
        if (response.data.data) {
          const formattedOptions = response.data.data.map((mode) => ({
            label: mode.RECMODENAME,
            value: mode.RECMODEID,
          }));
          setPayModeOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching pay modes:", error);
      }
    };

    fetchPrabhagOptions();
    fetchPayModes();
  }, [UlbId]);

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchLogo = useCallback(async () => {
    if (!UlbId) return null;
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

  const handleDownloadChallanPDF = async (values) => {
    setLoading(true);
    let dataToGeneratePDF = [];

    try {
      const fromDt = formatDate(values.fromDate);
      const toDt = formatDate(values.toDate);
      const prabhagId = values.ward;
      const payMode = values.paymentMode;
      const viewOnly = values.viewOnly;
      const challanDate = formatDate(values.challanDate); // Get challanDate

      if (!fromDt || !toDt || !prabhagId || !payMode) {
        alert(
          "Please select all required fields before generating the report."
        );
        setLoading(false);
        return;
      }

      let primaryApiUrl = "";
      let fileName = "";
      if (viewOnly) {
        primaryApiUrl = `${API_BASE_URL}/getFilteredGeneralReceipts`;
        fileName = "FilteredGeneralReceipts.pdf";
      } else {
        primaryApiUrl = `${API_BASE_URL}/getGenReceiptChallan`;
        fileName = "GeneralReceiptChallan.pdf";
      } 

      // --- First API Call ---
      try {
        const response = await axios.post(primaryApiUrl, {
          FromDt: fromDt,
          ToDt: toDt,
          PrabhagId: prabhagId,
          OrgId: UlbId,
          PayMode: payMode,
        });

        if (
          response.data &&
          response.data.data &&
          response.data.data.length > 0
        ) {
          dataToGeneratePDF = response.data.data;
        }
      } catch (error) {
        console.warn("Primary API call failed or returned no data:", error);
      }

      // --- Fallback API Call if primary API returned no data ---
      if (dataToGeneratePDF.length === 0) {
        console.log("Primary API returned no data, trying fallback API...");
        try {
          const fallbackResponse = await axios.post(
            `${API_BASE_URL}/getFilteredChallanDetails`,
            {
              ChallanDate: challanDate,
              OrgId: UlbId,
              PrabhagId: prabhagId,
              PayMode: payMode,
              FromDt: fromDt,
              ToDt: toDt,
            }
          );

          if (
            fallbackResponse.data &&
            fallbackResponse.data.data &&
            fallbackResponse.data.data.length > 0
          ) {
            dataToGeneratePDF = fallbackResponse.data.data;
            fileName = "FilteredChallanDetails.pdf"; // Adjust filename for fallback
          }
        } catch (fallbackError) {
          console.warn(
            "Fallback API call failed or returned no data:",
            fallbackError
          );
        }
      }

      // --- Generate PDF or Show Alert ---
      if (dataToGeneratePDF.length > 0) {
        const logo = await fetchLogo();
        await PDFGenerate({
          PDFComponent: (props) => (
            <GenrateChallan
              {...props}
              companyName="भिवंडी-निजामपुर महानगरपालिका, भिवंडी"
              logo={logo}
              fromDate={fromDt}
              toDate={toDt}
              data={dataToGeneratePDF}
              username={username}
            />
          ),
          data: dataToGeneratePDF,
          fileName: fileName,
        });
      } else {
        alert("No record found for the selected criteria across all sources.");
      }
    } catch (finalError) {
      console.error("An unexpected error occurred:", finalError);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          text={translate("General Receipt Challan Report")}
          className="mt-4 header-label"
        />
        <hr />

        <Formik
          initialValues={{
            challanDate: new Date(),
            fromDate: null,
            toDate: null,
            ward: "",
            paymentMode: "",
            viewOnly: false,
          }}
          onSubmit={handleDownloadChallanPDF}
        >
          {({ values, setFieldValue }) => (
            <Form className="container">
              <div className="row">
                <div className="col-md-4 col-12">
                  <Label text={translate("Challan Date:")} required />
                  <CalendarIcon
                    selectedDate={values.challanDate}
                    setSelectedDate={(date) =>
                      setFieldValue("challanDate", date)
                    }
                    placeholder="DD/MM/YYYY"
                    isToday={true}
                  />
                  <ErrorMessage
                    name="challanDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4 col-12">
                  <Label text={translate("From Date:")} required />
                  <CalendarIcon
                    selectedDate={values.fromDate}
                    setSelectedDate={(date) => setFieldValue("fromDate", date)}
                    placeholder="DD/MM/YYYY"
                    isToday={true}
                  />
                  <ErrorMessage
                    name="fromDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4 col-12">
                  <Label text={translate("To Date:")} required />
                  <CalendarIcon
                    selectedDate={values.toDate}
                    setSelectedDate={(date) => setFieldValue("toDate", date)}
                    placeholder="DD/MM/YYYY"
                    isToday={true}
                  />
                  <ErrorMessage
                    name="toDate"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4 col-12">
                  <Label text="Prabhag :" required />
                  <Field
                    name="ward"
                    component={InputField}
                    type="dropdown"
                    options={prabhagOptions}
                  />
                  <ErrorMessage
                    name="ward"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4 col-12">
                  <Label text="Payment Mode :" required />
                  <Field
                    name="paymentMode"
                    component={InputField}
                    type="dropdown"
                    options={payModeOptions}
                  />
                  <ErrorMessage
                    name="paymentMode"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4 col-12 d-flex align-items-center mt-4 mb-3">
                  <label htmlFor="viewOnly" className="me-2">
                    View Only :
                  </label>
                  <Field
                    type="checkbox"
                    id="viewOnly"
                    name="viewOnly"
                    className="form-check-input"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-4">
                <SaveButton type="submit" text="Submit" disabled={loading} />
                <SaveButton
                  type="button"
                  text={translate("Back")}
                  onClick={() => navigate("/Dashboard")}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmGeneralReceiptChallan;
