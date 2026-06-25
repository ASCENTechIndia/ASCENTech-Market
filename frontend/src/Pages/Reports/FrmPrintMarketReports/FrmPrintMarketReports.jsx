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
import PDFGenerate from "../../../Components/PDFButton/downloadPDF.jsx"; // Ensure this path is correct

// Import your Market Report PDF components
import GenerateSankshiptMarketPDF from "../../../Components/PDFButton/generateSankshiptPDF.jsx";
import GenerateTapshilMarketReport from "../../../Components/PDFButton/GenerateTapshilMarketReport.jsx";
import GenerateRojkirdMarketReport from "../../../Components/PDFButton/GenerateRojkirdMarketReport.jsx";

function FrmPrintMarketReports() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Assuming you have this env variable configured
  const { translate } = useLanguage();
  const { user } = useAuth();
  const ulbId = user?.ulbId || "5"; // Default to "5" if not available
  const org_id = user?.org_id || 5; // Default to 5 if not available

  const [prabhagOptions, setPrabhagOptions] = useState([]);
  const [tradeCategoryOptions, setTradeCategoryOptions] = useState([]);
  const [tradeTypeOptions, setTradeTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");

  const fetchLogo = useCallback(async () => {
    if (!ulbId) return null;
    try {
      const response = await axios.get(`${API_BASE_URL}/textlogo/${ulbId}`);
      if (response.data.success) {
        const { ULBLOGO } = response.data.data;
        setLogoUrl(ULBLOGO);
        return ULBLOGO;
      }
    } catch (error) {
      console.error("Error fetching logo:", error);
    }
    return null;
  }, [ulbId, API_BASE_URL]);

  useEffect(() => {
    // Fetch Prabhag (Ward Names)
    const fetchPrabhagData = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/getWardNamesAndIdsByUlbId`,
          { ulbId: ulbId }
        );
        if (response.data && response.data.data) {
          const options = response.data.data.map((item) => ({
            value: item.WARDID,
            label: item.WARDNAME,
          }));
          setPrabhagOptions(options);
        }
      } catch (error) {
        console.error("Error fetching Prabhag data:", error);
      }
    };

    // Fetch Trade Category
    const fetchTradeCategoryData = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/TradeCategory`, {
          org_id: org_id,
        });
        if (response.data && response.data.data) {
          const options = response.data.data.map((item) => ({
            value: item.TRADECATEGORYID,
            label: item.TRADECATEGORYNAME,
          }));
          setTradeCategoryOptions(options);
        }
      } catch (error) {
        console.error("Error fetching Trade Category data:", error);
      }
    };

    fetchPrabhagData();
    fetchTradeCategoryData();
    fetchLogo(); // Fetch logo on initial load
  }, [user, ulbId, org_id, fetchLogo]); // Re-run if user changes

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}/${month}/${year}`; // DD/MM/YYYY format
  };

  // Function for Sankshipt API (expects YYYY-MM-DD)
  const formatDateForSankshiptAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  };

  // Function for Tapshil And Rojkird API (expects DD-MM-YYYY)
  const formatDateForTapshilAndRojkirdAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`; // DD-MM-YYYY format
  };

  const handleDownloadSankshipt = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/FrmPrintSankshil`, {
        FromDt: formatDateForSankshiptAPI(values.FromDate),
        ToDt: formatDateForSankshiptAPI(values.ToDate),
        OrgId: org_id.toString(),
        ZoneId: "-1",
        TradeCategoryId: "-1",
        TradeTypeId: "-1",
      });

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const logo = await fetchLogo();
        await PDFGenerate({
          PDFComponent: (props) => (
            <GenerateSankshiptMarketPDF
              {...props}
              companyName="भिवंडी-निजामपुर महानगरपालिका, भिवंडी"
              logo={logo}
              fromDate={formatDate(values.FromDate)}
              toDate={formatDate(values.ToDate)}
            />
          ),
          data: response.data.data, // Access the 'data' array from the response
          fileName: "SankshiptMarketReport.pdf",
        });
      } else {
        alert(
          "No Sankshipt market report data found for the selected criteria."
        );
      }
    } catch (error) {
      console.error("Error fetching Sankshipt market data:", error);
      alert("Failed to fetch Sankshipt market report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTapshil = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/FrmPrintTapshil`, {
        FromDt: formatDateForTapshilAndRojkirdAPI(values.FromDate),
        ToDt: formatDateForTapshilAndRojkirdAPI(values.ToDate),
        OrgId: org_id.toString(), // Ensure OrgId is a string if the API expects it
        ZoneId: "-1", // Use -1 for "All" or if no specific ward is selected
        TradeCategoryId: "-1", // Use -1 for "All"
        TradeTypeId: "-1", // Use -1 for "All"
      });

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const logo = await fetchLogo();
        await PDFGenerate({
          PDFComponent: (props) => (
            <GenerateTapshilMarketReport
              {...props}
              companyName="भिवंडी-निजामपुर महानगरपालिका, भिवंडी"
              logo={logo}
              fromDate={formatDate(values.FromDate)}
              toDate={formatDate(values.ToDate)}
            />
          ),
          data: response.data.data, // Access the 'data' array from the response
          fileName: "TapshilMarketReport.pdf",
        });
      } else {
        alert("No Tapshil market report data found for the selected criteria.");
      }
    } catch (error) {
      console.error("Error fetching Tapshil market data:", error);
      alert("Failed to fetch Tapshil market report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadRojkird = async (values) => {
    setLoading(true);
    try {
      // Use the new API endpoint and format dates accordingly
      const response = await axios.post(
        `${API_BASE_URL}/getFilteredReceiptDetails`,
        {
          FromDt: formatDateForTapshilAndRojkirdAPI(values.FromDate),
          ToDt: formatDateForTapshilAndRojkirdAPI(values.ToDate),
          OrgId: org_id.toString(),
          ZoneId: "-1",
          TradeCategoryId: "-1", // Send -1 for "All"
          TradeTypeId: "-1", // Send -1 for "All"
        }
      );

      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        const logo = await fetchLogo();
        await PDFGenerate({
          PDFComponent: (props) => (
            <GenerateRojkirdMarketReport
              {...props}
              companyName="भिवंडी-निजामपुर महानगरपालिका, भिवंडी" // Example company name
              logo={logo}
              fromDate={formatDate(values.FromDate)}
              toDate={formatDate(values.ToDate)}
            />
          ),
          data: response.data.data, // Access the 'data' array from the response
          fileName: "RojkirdMarketReport.pdf",
        });
      } else {
        alert("No Rojkird market report data found for the selected criteria.");
      }
    } catch (error) {
      console.error("Error fetching Rojkird market data:", error);
      alert("Failed to fetch Rojkird market report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (values) => {
    if (!values.FromDate || !values.ToDate || values.ReportType === "") {
      alert(
        "Please fill in the required fields (From Date, To Date, and Report Type) to view the report."
      );
      return;
    }

    switch (values.ReportType) {
      case "1":
        handleDownloadSankshipt(values);
        break;
      case "2":
        handleDownloadTapshil(values);
        break;
      case "3":
        handleDownloadRojkird(values);
        break;
      default:
        alert("Please select a valid report type.");
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("Market Reports")}
        />
        <hr />

        <Formik
          initialValues={{
            ReportType: "",
            FromDate: "",
            ToDate: "",
            Prabhag: "",
            TradeCategory: "",
            TradeType: "",
          }}
          onSubmit={(values) => {
            handleViewReport(values); // Call the report generation logic on submit
          }}
        >
          {({ setFieldValue, values }) => {
            // Call fetchTradeTypes here to react to TradeCategory changes
            useEffect(() => {
              const fetchTradeTypes = async () => {
                if (values.TradeCategory && ulbId) {
                  try {
                    const response = await axios.post(
                      `${API_BASE_URL}/getTradeTypesByCategory`,
                      {
                        tradeCategoryId: values.TradeCategory,
                        ulbId: ulbId,
                      }
                    );
                    if (response.data && response.data.data) {
                      const options = response.data.data.map((item) => ({
                        value: item.TRADETYPEID,
                        label: item.NUM_RATE_TRADETYPENAME,
                      }));
                      setTradeTypeOptions(options);
                    } else {
                      setTradeTypeOptions([]); // Clear if no data
                    }
                  } catch (error) {
                    console.error("Error fetching Trade Types:", error);
                    setTradeTypeOptions([]);
                  }
                } else {
                  setTradeTypeOptions([]);
                  setFieldValue("TradeType", "");
                }
              };
              fetchTradeTypes();
            }, [values.TradeCategory, ulbId, setFieldValue]);

            return (
              <Form>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="mb-2">
                      <Label
                        text={`${translate("दिनांका पासून")} :`}
                        required
                      />
                    </div>
                    <CalendarIcon
                      name="FromDate"
                      selectedDate={values.FromDate}
                      setSelectedDate={(date) => {
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
                      <Label
                        text={`${translate("दिनांका पर्यंत")} :`}
                        required
                      />
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

                  <div className="col-md-4">
                    <Label text={`${translate("Report Type")} :`} required />
                    <Field
                      name="ReportType"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      options={[
                        { value: "1", label: "संक्षिप्त अहवाल" },
                        { value: "2", label: "तपशील अहवाल" },
                        { value: "3", label: "रोजकीर्द अहवाल" },
                      ]}
                    />
                    <ErrorMessage
                      name="ReportType"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <Label text={`${translate("प्रभाग")} :`} required />
                    <Field
                      name="Prabhag"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      options={[...prabhagOptions]}
                    />
                    <ErrorMessage
                      name="Prabhag"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("Trade Category")} :`} required />
                    <Field
                      name="TradeCategory"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      options={[...tradeCategoryOptions]}
                      onChange={(e) => {
                        setFieldValue("TradeCategory", e.target.value);
                        setFieldValue("TradeType", "");
                      }}
                    />
                    <ErrorMessage
                      name="TradeCategory"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("Trade Type")} :`} required />
                    <Field
                      name="TradeType"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      options={[
                        { value: "-1", label: "All" },
                        ...tradeTypeOptions,
                      ]}
                      disabled={!values.TradeCategory} // Disable until a Trade Category is selected
                    />
                    <ErrorMessage
                      name="TradeType"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-3 mt-4">
                  <SaveButton
                    type="submit"
                    text={translate("View Report")}
                    disabled={loading}
                  />
                  <SaveButton type="button" text={translate("Cancel")} />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default FrmPrintMarketReports;
