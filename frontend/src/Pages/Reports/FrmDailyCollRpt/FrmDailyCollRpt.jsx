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
import axios from "axios";
import { pdf } from "@react-pdf/renderer";
import FrmDailyCollRptPDF from "../../../Components/PDFButton/FrmDailyCollRpt";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
function FrmDailyCollRpt() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const [wardOptions, setWardOptions] = useState([]);
  const [payModeOptions, setPayModeOptions] = useState([]);
  const [financialYearOptions, setFinancialYearOptions] = useState([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const fetchLogoAndCompanyName = useCallback(async () => {
    if (!user?.ulbId) return null;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/textlogo/${user.ulbId}`
      );
      if (response.data.success) {
        const { ULBLOGO, ULBNAME } = response.data.data;
        setLogoUrl(ULBLOGO);
        return { ULBLOGO, ULBNAME };
      }
    } catch (error) {
      console.error("Error fetching logo and text:", error);
    }
    return null;
  }, [user?.ulbId, API_BASE_URL]);

  useEffect(() => {
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
              label: ward.WARDNAME,
              value: ward.WARDID,
            }));
            setWardOptions(formattedOptions);
          }
        } catch (error) {
          console.error("Error fetching ward names:", error);
        }
      };

      const fetchPayModes = async () => {
        try {
          const response = await axios.post(
            `${API_BASE_URL}/getRecModeConfig`,
            { ulbId: user.ulbId }
          );
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

      const fetchFinancialYears = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/getFinancialYears`);
          if (response.data.data) {
            const formattedOptions = response.data.data.map((year) => ({
              label: year.FINANCIALYEARNAME,
              value: year.FINANCIALYEARID,
            }));
            setFinancialYearOptions(formattedOptions);
          }
        } catch (error) {
          console.error("Error fetching financial years:", error);
        }
      };

      fetchWardNames();
      fetchPayModes();
      fetchFinancialYears();
      fetchLogoAndCompanyName();
    }
  }, [user, fetchLogoAndCompanyName]);

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const payload = {
        ulbId: user.ulbId,
        FromDt: formatDate(values.FromDate),
        ToDt: formatDate(values.ToDate),
        ZoneId: values.Prabhag,
        PayModeId: values.PayMode,
      };

      // Changed API endpoint here
      const response = await axios.post(
        `${API_BASE_URL}/FrmDailyCollRpt`, // Updated API endpoint
        payload
      );

      if (response.data.data && response.data.data.length > 0) {
        const blob = await pdf(
          <FrmDailyCollRptPDF
            companyName="IN USE भिवंडी-निजामपुर महानगरपालिका, भिवंडी"
            logo={logoUrl}
            data={response.data.data}
          />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "DailyCollectionReport.pdf"); // Changed filename for clarity
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("No data found for the selected criteria.");
      }
    } catch (error) {
      console.error(
        "Error fetching daily collection report or generating PDF:",
        error
      );
      alert("Error generating PDF. Please try again.");
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
          text={translate("दैनिक वसुली अहवाल")}
        />
        <hr />

        <Formik
          initialValues={{
            Prabhag: "",
            FromDate: null,
            ToDate: null,
            PayMode: "",
            FinancialYear: "",
          }}
          onSubmit={handleSubmit}
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
                    selectedDate={values.FromDate}
                    setSelectedDate={(date) => {
                      console.log(
                        "CalendarIcon (FromDate) manual select:",
                        date
                      );
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
                    selectedDate={values.ToDate}
                    setSelectedDate={(date) => {
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

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("Pay Mode")} :`} required />
                  <Field
                    name="PayMode"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                    options={payModeOptions}
                    placeholder={translate("Select Pay Mode")}
                  />
                  <ErrorMessage
                    name="PayMode"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("Financial Year")} :`} required />
                  <Field
                    name="FinancialYear"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                    options={financialYearOptions}
                    placeholder={translate("Select Financial Year")}
                    onChange={(e) => {
                      const selectedValue = e.target.value;
                      console.log(
                        "FinancialYear selected value (ID):",
                        selectedValue
                      );
                      setFieldValue("FinancialYear", selectedValue); // Keep this as string for Formik

                      // Convert selectedValue to a number for lookup if financialYearOptions.value is number
                      const selectedValueAsNumber = Number(selectedValue);

                      const selectedYearOption = financialYearOptions.find(
                        // Make sure comparison type matches: Use selectedValueAsNumber
                        (option) => option.value === selectedValueAsNumber
                      );

                      if (selectedYearOption) {
                        const yearLabel = selectedYearOption.label;
                        console.log("FinancialYear label:", yearLabel);

                        // Assuming yearLabel is like "2023-2024"
                        const years = yearLabel.split("-").map(Number);

                        if (years.length === 2) {
                          const startYear = years[0];
                          const endYear = years[1];

                          const newFromDate = new Date(startYear, 3, 1); // April 1st
                          console.log("Calculated newFromDate:", newFromDate);
                          setFieldValue("FromDate", newFromDate);

                          const newToDate = new Date(endYear, 2, 31); // March 31st
                          console.log("Calculated newToDate:", newToDate);
                          setFieldValue("ToDate", newToDate);
                        } else {
                          console.warn(
                            "FinancialYear label format unexpected:",
                            yearLabel
                          );
                          // It's good to clear dates if format is bad
                          setFieldValue("FromDate", null);
                          setFieldValue("ToDate", null);
                        }
                      } else {
                        // This block should now only execute if "Select Financial Year" is picked
                        console.log(
                          "FinancialYear option not found or cleared, setting dates to null."
                        );
                        setFieldValue("FromDate", null);
                        setFieldValue("ToDate", null);
                      }
                    }}
                  />
                  <ErrorMessage
                    name="FinancialYear"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton
                  type="submit"
                  text={loading ? "Generating PDF..." : translate("शोधा")}
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

export default FrmDailyCollRpt;
