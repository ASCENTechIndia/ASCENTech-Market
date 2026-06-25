import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../../Context/AuthContext";
import axios from "axios";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import Table from "../../../Components/Table/Table"; // Import the Table component
import PDFGenerate from "../../../Components/PDFButton/downloadPDF";
import PrintCollectionReport from "../../../Components/PDFButton/PrintCollectionReport";
import apiService from "../../../../apiService";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmReceiptReprint() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const [logoUrl, setLogoUrl] = useState("");
  const [CorporationName, setCorporationName] = useState("");
  const [loading, setLoading] = useState(false);
  // Local state for dates, used by CalendarIcon
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [corporationOptions, setCorporationOptions] = useState([]);
  const [financialYearOptions, setFinancialYearOptions] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Use a ref to store Formik's setFieldValue for use in effects
  const formikSetFieldValueRef = useRef(null);

  const [initialValues, setInitialValues] = useState({
    ULBName: "",
    ReceiptNo: "",
    FinancialYear: "",
    FromDate: null, // Initialize as null for CalendarIcon
    ToDate: null, // Initialize as null for CalendarIcon
  });

  // Function to calculate and set FromDate and ToDate based on Financial Year
  // This function now accepts a setter for Formik fields and local state setters
  const setFinancialYearDates = (
    yearId,
    formikSetter,
    localFromDateSetter,
    localToDateSetter,
    financialYears // This is crucial for lookup accuracy
  ) => {
    console.log("setFinancialYearDates called for yearId:", yearId);
    console.log("Current financialYears array:", financialYears);

    const selectedYearOption = financialYears.find(
      (opt) => String(opt.value) === String(yearId) // Ensure string comparison for safety
    );

    console.log("selectedYearOption found:", selectedYearOption);

    if (selectedYearOption) {
      const yearLabel = selectedYearOption.label;
      let fromDateCalculated = null;
      let toDateCalculated = null;

      console.log("Processing yearLabel:", yearLabel);

      if (yearLabel === "Current Year") {
        const today = new Date();
        let currentCalendarYear = today.getFullYear();
        // If current month is Jan (0), Feb (1), or Mar (2), the financial year started last year.
        if (today.getMonth() >= 0 && today.getMonth() <= 2) {
          currentCalendarYear--;
        }
        fromDateCalculated = new Date(currentCalendarYear, 3, 1); // April 1st (month 3 is April)
        toDateCalculated = new Date(currentCalendarYear + 1, 2, 31); // March 31st (month 2 is March) of next calendar year
        console.log(
          `Calculated for "Current Year": From ${fromDateCalculated.toLocaleDateString()} To ${toDateCalculated.toLocaleDateString()}`
        );
      } else {
        // Handle "YYYY-YY" or "YYYY-YYYY" format
        const parts = yearLabel.split("-");
        console.log("Split parts for year label:", parts);

        if (parts.length < 2) {
          console.error("Invalid financial year label format:", yearLabel);
          formikSetter("FromDate", null);
          formikSetter("ToDate", null);
          localFromDateSetter(null);
          localToDateSetter(null);
          return;
        }

        let startYear = parseInt(parts[0], 10);
        let endYear;

        if (parts[1].length === 2) {
          // "2024-25" format, means 2024-2025
          endYear = startYear + 1;
        } else {
          // "2024-2025" format
          endYear = parseInt(parts[1], 10);
        }

        console.log(`Parsed years: startYear=${startYear}, endYear=${endYear}`);

        fromDateCalculated = new Date(startYear, 3, 1); // April 1st
        toDateCalculated = new Date(endYear, 2, 31); // March 31st
        console.log(
          `Calculated for "${yearLabel}": From ${fromDateCalculated.toLocaleDateString()} To ${toDateCalculated.toLocaleDateString()}`
        );
      }

      // Update Formik's values
      formikSetter("FromDate", fromDateCalculated);
      formikSetter("ToDate", toDateCalculated);

      // Update local state for CalendarIcon to display
      localFromDateSetter(fromDateCalculated);
      localToDateSetter(toDateCalculated);
      console.log("Dates successfully set in Formik and local state.");
    } else {
      console.warn(
        `No financial year option found for ID: ${yearId}. Clearing dates.`
      );
      // If no year selected or invalid, clear dates
      formikSetter("FromDate", null);
      formikSetter("ToDate", null);
      localFromDateSetter(null);
      localToDateSetter(null);
    }
  };

  // Fetch Corporations
  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        debugger;
        const response = await apiService.get("CorporationDropdown");
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((corp) => ({
            value: corp.CORPID,
            label: corp.CORPNAME,
          }));
          setCorporationOptions(options);
          console.log("Corporation Options fetched:", options);

          if (ulbId) {
            const currentUserUlb = options.find(
              (option) => String(option.value) === String(ulbId)
            );
            if (currentUserUlb) {
              setInitialValues((prev) => ({
                ...prev,
                ULBName: currentUserUlb.value,
              }));
              console.log("Initial ULBName set:", currentUserUlb.value);
            }
          }
        } else {
          setCorporationOptions([]);
          console.warn("Invalid corporation data:", response.data);
        }
      } catch (err) {
        console.error("Error fetching corporation dropdown:", err);
      }
    };

    fetchCorporations();
  }, [ulbId]);

  // Fetch Financial Years and set initial "Current Year" dates
  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        const response = await apiService.get("getFinancialYears");
        if (response.data.data) {
          const formattedOptions = response.data.data.map((year) => ({
            label: year.FINANCIALYEARNAME,
            value: year.FINANCIALYEARID,
          }));
          setFinancialYearOptions(formattedOptions);
          console.log("Financial Year Options fetched:", formattedOptions);

          const currentYearOption = formattedOptions.find(
            (option) => option.label === "Current Year"
          );
          if (currentYearOption) {
            setInitialValues((prev) => {
              const newInitialValues = {
                ...prev,
                FinancialYear: currentYearOption.value,
              };
              console.log(
                "Setting initial FinancialYear:",
                currentYearOption.value
              );

              // IMPORTANT: Call setFinancialYearDates to populate FromDate/ToDate
              // This is a special setter for initialValues within useEffect.
              setFinancialYearDates(
                currentYearOption.value,
                (field, value) => {
                  newInitialValues[field] = value; // Update the object passed to setInitialValues
                },
                setFromDate, // Update local state for CalendarIcon
                setToDate, // Update local state for CalendarIcon
                formattedOptions // Pass the complete list of options for lookup
              );
              console.log(
                "New initialValues after date calculation:",
                newInitialValues
              );
              return newInitialValues;
            });
          } else {
            console.warn(
              "'Current Year' option not found in financial years data."
            );
          }
        }
      } catch (error) {
        console.error("Error fetching financial years:", error);
      }
    };

    fetchFinancialYears();
  }, []); // Empty dependency array means this runs once on mount

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSearch = async (values) => {
    console.log("Form submitted with values:", values);
    const requestBody = {
      ULB_ID: values.ULBName, // Use the selected ULB ID from Formik values
      FROM_DATE: formatDate(values.FromDate),
      TO_DATE: formatDate(values.ToDate),
      RECEIPT_NO: values.ReceiptNo,
    };

    // Validation check: Ensure either From/To Dates or Receipt No is provided
    if (
      !requestBody.RECEIPT_NO &&
      (!requestBody.FROM_DATE || !requestBody.TO_DATE)
    ) {
      alert(translate("Please provide either Receipt No or a date range."));
      return;
    }

    try {
      const response = await apiService.post("FrmReceiptReprint", requestBody);

      console.log("API Response:", response.data);

      if (response.data && Array.isArray(response.data.data)) {
        setTableData(response.data.data);
      } else {
        setTableData([]);
        alert(translate("No records found."));
      }
    } catch (error) {
      console.error("Error fetching receipt reprint data:", error);
      setTableData([]);
      alert(translate("An error occurred while fetching data."));
    }
  };
  // fetchLogo function (already provided by you)
  // ✅ Fetch logo and return it directly
const fetchLogo = useCallback(async () => {
  if (!ulbId) return { logo: "", corpName: "" };
  try {
    const response = await apiService.get(`textlogo/${ulbId}`);
    if (response.data.success) {
      const { ULBLOGO, ABC_MUNICIPAL_TEXT } = response.data.data;
      // Update React state (for UI display if needed)
      setLogoUrl(ULBLOGO);
      setCorporationName(ABC_MUNICIPAL_TEXT);
      // Return values directly for immediate use
      return { logo: ULBLOGO, corpName: ABC_MUNICIPAL_TEXT };
    }
  } catch (error) {
    console.error("Error fetching logo and text:", error);
  }
  return { logo: "", corpName: "" };
}, [ulbId]);


// ✅ Use returned logo + text directly in PDF generation
const handleDownloadPDF = useCallback(
  async (pdfData) => {
    setLoading(true);
    try {
      const { licId, licNo, corporationId, recNo } = pdfData;

      if (!licId || !licNo || !corporationId || !recNo) {
        alert("Error: Missing data for PDF generation.");
        setLoading(false);
        return;
      }

      // Fetch receipt report data
      const response = await apiService.post("FinalFrmReceiptReprint", {
        LicenseId: licId,
        LICNO: licNo,
        CORPORATION_ID: corporationId,
        Receipt_no: recNo,
      });

      // Fetch logo + corporation text dynamically
      const { logo, corpName } = await fetchLogo();

      if (response.data && response.data.data) {
        await PDFGenerate({
          PDFComponent: (props) => (
            <PrintCollectionReport
              {...props}
              companyName={corpName}
              logo={logo}
            />
          ),
          data: response.data.data,
          fileName: `MarketLicenseCollection_${recNo}.pdf`,
        });
      } else {
        alert("No data to generate PDF");
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  },
  [ulbId, fetchLogo]
);

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("Receipt Reprint")}
        />
        <hr />
        <Formik
          initialValues={initialValues}
          onSubmit={handleSearch}
          enableReinitialize={true} // Important for initialValues updates to reflect
        >
          {({ setFieldValue, values }) => {
            // Store setFieldValue in ref for use in effects if needed outside Formik render prop
            if (!formikSetFieldValueRef.current) {
              formikSetFieldValueRef.current = setFieldValue;
            }

            // You can also add logs here to see Formik's current state of dates
            // console.log("Formik values.FromDate:", values.FromDate);
            // console.log("Formik values.ToDate:", values.ToDate);
            // console.log("Local fromDate state:", fromDate);
            // console.log("Local toDate state:", toDate);

            return (
              <Form>
                <div className="row mb-3 align-items-center mt-4">
                  <div className="col-md-6">
                    <div className="mb-2">
                      <Label text={`${translate("ULB Name")} :`} required />
                    </div>
                    <Field
                      name="ULBName"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      options={corporationOptions}
                      disabled={!!ulbId}
                    />
                    <ErrorMessage
                      name="ULBName"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <Label text={`${translate("Receipt No")} :`} required />
                    </div>
                    <Field
                      name="ReceiptNo"
                      component={InputField}
                      className="form-control"
                    />
                    <ErrorMessage
                      name="ReceiptNo"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <div className="mb-2">
                      <Label
                        text={`${translate("Financial Year")} :`}
                        required
                      />
                    </div>
                    <Field
                      name="FinancialYear"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      options={financialYearOptions}
                      onChange={(e) => {
                        const yearId = e.target.value;
                        setFieldValue("FinancialYear", yearId); // Update Formik's value for the dropdown
                        // Trigger date calculation and update
                        setFinancialYearDates(
                          yearId,
                          setFieldValue, // Pass Formik's setFieldValue for form updates
                          setFromDate, // Pass local state setter for CalendarIcon display
                          setToDate, // Pass local state setter for CalendarIcon display
                          financialYearOptions // Crucial: Pass the current list of options for lookup
                        );
                      }}
                      // The initial value is set via `initialValues` state,
                      // and the `useEffect` handles populating dates for it.
                    />
                    <ErrorMessage
                      name="FinancialYear"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <div className="mb-2">
                      <Label text={`${translate("From Date")} :`} required />
                    </div>
                    <CalendarIcon
                      name="FromDate"
                      selectedDate={fromDate} // Use local state for display
                      setSelectedDate={(date) => {
                        // This setter is theoretically disabled but included for completeness
                        setFromDate(date);
                        setFieldValue("FromDate", date);
                      }}
                      placeholder="DD/MM/YYYY"
                      disabled // Disable manual date selection, dates are set by Financial Year
                    />
                    <ErrorMessage
                      name="FromDate"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <div className="mb-2">
                      <Label text={`${translate("To Date")} :`} required />
                    </div>
                    <CalendarIcon
                      name="ToDate"
                      selectedDate={toDate} // Use local state for display
                      setSelectedDate={(date) => {
                        // This setter is theoretically disabled but included for completeness
                        setToDate(date);
                        setFieldValue("ToDate", date);
                      }}
                      placeholder="DD/MM/YYYY"
                      disabled // Disable manual date selection, dates are set by Financial Year
                    />
                    <ErrorMessage
                      name="ToDate"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
                  <SaveButton type="submit" text={translate("Search")} />
                  <SaveButton type="button" text={translate("Back")} />
                </div>
              </Form>
            );
          }}
        </Formik>
        {Array.isArray(tableData) && tableData.length > 0 && (
          <div className="table-Box mt-5">
            <Table
              headers={[
                translate("Ward"),
                translate("Application No"),
                translate("License No"),
                translate("Shop Name"),
                translate("Business Year"),
                translate("Receipt No"),
                translate("Receipt Date"),
                translate("Amount"),
                translate("Print"),
              ]}
              data={tableData.map((row) => ({
                WARDNAME: row.WARDNAME,
                APPLICATIONNO: row.APPLICATIONNO,
                LICNO: row.LICNO,
                SHOPNAME: row.SHOPNAME,
                BUSINESSYEAR: row.BUSINESSYEAR,
                RCPTNO: row.RCPTNO,
                RECIPTDATE: row.RECIPTDATE,
                RECAMOUNT: row.RECAMOUNT,
                Print: (
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      handleDownloadPDF({
                        licId: row.LICE_ID, // assuming API provides this field
                        licNo: row.LICNO,
                        corporationId: ulbId,
                        recNo: row.RCPTNO,
                      });
                    }}
                  >
                    {translate("Print")}
                  </button>
                ),
              }))}
              keyMapping={{
                [translate("Ward")]: "WARDNAME",
                [translate("Application No")]: "APPLICATIONNO",
                [translate("License No")]: "LICNO",
                [translate("Shop Name")]: "SHOPNAME",
                [translate("Business Year")]: "BUSINESSYEAR",
                [translate("Receipt No")]: "RCPTNO",
                [translate("Receipt Date")]: "RECIPTDATE",
                [translate("Amount")]: "RECAMOUNT",
                [translate("Print")]: "Print",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmReceiptReprint;
