import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useAuth } from "../../../Context/AuthContext";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useLanguage } from "../../../Context/LanguageProvider";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import apiService from "../../../../apiService";
import Table from "../../../Components/Table/Table";
import PDFGenerate from "../../../Components/PDFButton/downloadPDF";
import PrintCollectionReport from "../../../Components/PDFButton/PrintCollectionReport";
import { useNavigate } from "react-router-dom";



function FrmCollection() {
  const { translate } = useLanguage();
  const [ReciptDate, setReciptDate] = useState(null);
  const [ChequeDate, setChequeDate] = useState(null);
  const { user } = useAuth();
  const userId = user?.userId;
  const collcenterid = user?.collcenterid;
  const OrgId = user?.ulbId;
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [logoUrl, setLogoUrl] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const LicenseNoFromParams = params.get("licenseNo");
  const applicationIdFromParams = params.get("applicationId");
  console.log("Application ID from URL:", applicationIdFromParams);

  const [payModeOptions, setPayModeOptions] = useState([]);
  const [bankNameOptions, setBankNameOptions] = useState([]);
  const [corporationCode, setCorporationCode] = useState(null);
  const [isCashPayment, setIsCashPayment] = useState(false);
  const [latestReceiptId, setLatestReceiptId] = useState(null);

  const [billingDetails, setBillingDetails] = useState([]);
  // Ref to store the original, unmodified data fetched from the API
  const originalBillingDetailsRef = useRef([]);
  const [inStr, setInStr] = useState("");
  const formikSetFieldValueRef = useRef(null);
  const [originalTotalAmount, setOriginalTotalAmount] = useState(0);

  const [initialFormValues, setInitialFormValues] = useState({
    LicenseNo: LicenseNoFromParams || "",
    OwnerName: "",
    ReciptDate: null,
    PaymentType: "",
    MobileNo: "",
    BankName: "",
    BankBranchName: "",
    ChequeNo: "",
    ChequeDate: null,
    Amount: "",
    paymentMethod: "Full Payment", // Set initial value to "Full Payment"
    Remark: "",
    ReceiptIdField: "",
    // These will be populated from the fetched market license details
    MARKETLICENSEID: null,
    APPLICATIONID: null,
    YEARID: null,
  });

  // fetchLogo function (already provided by you)
const fetchLogo = useCallback(async () => {
  if (!OrgId) return null;
  try {
    const response = await apiService.get(`textlogo/${OrgId}`);
    if (response.data.success && response.data.data) {
      const { ULBLOGO, ABC_MUNICIPAL_TEXT } = response.data.data;

      return {
        logo: ULBLOGO,
        companyName: ABC_MUNICIPAL_TEXT,
      };
    }
  } catch (error) {
    console.error("Error fetching logo and text:", error);
  }
  return {
    logo: null,
    companyName: null,
  };
}, [OrgId]);


  // Modified handleDownloadPDF function (no changes here, keeping previous string conversion)
  const handleDownloadPDF = useCallback(
    async (pdfData) => {
      setLoading(true);
      try {
        debugger;
        const { licId, licNo, corporationId, recNo } = pdfData;

        // Ensure all required parameters are present
        if (!licId || !licNo || !corporationId || !recNo) {
          console.error("Missing PDF generation parameters:", pdfData);
          alert("Error: Missing data for PDF generation.");
          setLoading(false);
          return;
        }

        // Fetch report data from the API using POST
        const response = await apiService.post(
          `PrintCollectionReceipt`,
          {
            licId: licId,
            licNo: licNo,
            corporationId: corporationId,
            recNo: recNo,
          }
        );

        if (response.data) {
          console.log("PDF Report Data:", response.data);
          const { logo, companyName } = await fetchLogo();
console.log("Logo for PDF:", logo, companyName);


          await PDFGenerate({
            PDFComponent: (props) => (
              <PrintCollectionReport
                {...props}
                companyName={companyName}
                logo={logo}
              />
            ),
            data: response.data.data,
            fileName: `MarketLicenseCollection_${recNo}.pdf`, // Dynamic filename
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
    [OrgId, fetchLogo]
  ); // Dependencies for useCallback

  // useEffect for fetching Payment Modes
  useEffect(() => {
    const fetchPayModes = async () => {
      if (!OrgId) {
        console.warn(
          "User or ulbId not available. Skipping API call for payment modes."
        );
        return;
      }
      try {
        const response = await apiService.post(`getRecModeConfig`, {
          ulbId: OrgId,
        });
        if (response.data?.data && Array.isArray(response.data.data)) {
          const formattedOptions = response.data.data.map((mode) => ({
            label: mode.RECMODENAME,
            value: mode.RECMODEID,
          }));
          setPayModeOptions(formattedOptions);
        } else {
          setPayModeOptions([]);
          console.warn(
            "API response for payment modes did not contain 'data' array or was empty:",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching pay modes:", error);
        setPayModeOptions([]);
      }
    };
    fetchPayModes();
  }, [OrgId]);

  // useEffect for fetching Bank Names
  useEffect(() => {
    const fetchBankNames = async () => {
      if (!OrgId) {
        console.warn(
          "User or ulbId not available. Skipping API call for bank names."
        );
        return;
      }
      try {
        const response = await apiService.post(`fetchBankNames`, {
          ulbId: OrgId,
        });
        if (response.data?.data && Array.isArray(response.data.data)) {
          const formattedOptions = response.data.data.map((bank) => ({
            label: bank.BANK_NAME,
            value: bank.BANK_ID,
          }));
          setBankNameOptions(formattedOptions);
        } else {
          setBankNameOptions([]);
          console.warn(
            "API response for bank names did not contain 'data' array or was empty:",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching bank names:", error);
        setBankNameOptions([]);
      }
    };
    fetchBankNames();
  }, [OrgId]);

  // useEffect for fetching Market License Billing Details and setting initial form values
  useEffect(() => {
    const fetchMarketLicenseDetails = async () => {
      if (LicenseNoFromParams && OrgId) {
        try {
          const response = await apiService.post(
            `getMarketLicenseBillingDetails`,
            { licenseNo: LicenseNoFromParams, ulbId: OrgId }
          );

          if (response.data?.data && response.data.data.length > 0) {
            const fetchedData = response.data.data;

            // Store the original fetched data in a ref for later calculations
            originalBillingDetailsRef.current = fetchedData;

            // Calculate total amount from all items for "Outstanding Amt" in the table
            const totalAmountSum = fetchedData.reduce(
              (sum, item) => sum + parseFloat(item.TOTALAMOUNT || 0),
              0
            );
            setOriginalTotalAmount(totalAmountSum);

            // Set initial form values based on the first item (assuming common details)
            setInitialFormValues((prevValues) => ({
              ...prevValues,
              LicenseNo: fetchedData[0].LICENSENO || "",
              OwnerName: fetchedData[0].OWNERNAME || "",
              MobileNo: fetchedData[0].CONTACTNO
                ? String(fetchedData[0].CONTACTNO)
                : "",
              YEARID: fetchedData[0].YEARID,
              APPLICATIONID: fetchedData[0].APPLICATIONID,
              MARKETLICENSEID: fetchedData[0].MARKETLICENSEID,
              // Amount will be set by the paymentMethod useEffect after initial load
              Amount:
                prevValues.paymentMethod === "Full Payment"
                  ? totalAmountSum.toString()
                  : "",
            }));

            // Initialize billingDetails for table display.
            // When data is first fetched, `CURRENTAMOUNT` should reflect the outstanding,
            // or 0 if it's part payment and no amount entered yet.
            // The later useEffects will refine this based on paymentMethod.
            const initialTableData = fetchedData.map((item) => ({
              ...item,
              // Initially show the full outstanding as 'Collection Amt' for Full Payment, else 0
              CURRENTAMOUNT:
                initialFormValues.paymentMethod === "Full Payment"
                  ? parseFloat(item.TOTALAMOUNT || 0)
                  : 0,
            }));
            setBillingDetails(initialTableData);
          } else {
            console.warn(
              "API response for market license details did not contain 'data' array or was empty:",
              response.data
            );
            setBillingDetails([]);
            setOriginalTotalAmount(0);
            originalBillingDetailsRef.current = []; // Clear ref as well
          }
        } catch (error) {
          console.error("Error fetching market license details:", error);
          setBillingDetails([]);
          setOriginalTotalAmount(0);
          originalBillingDetailsRef.current = []; // Clear ref as well
        }
      }
    };
    fetchMarketLicenseDetails();
  }, [LicenseNoFromParams, OrgId]);

  // Effect to generate inStr whenever billingDetails changes
  useEffect(() => {
    if (billingDetails.length > 0) {
      const generatedString = billingDetails
        .map(
          (item) =>
            `${item.YEARID}$${item.YEARNAME}$${item.CURRENTAMOUNT || 0}$${
              item.TOTALAMOUNT
            }$${item.MARKETLICENSEID}$${item.APPLICATIONID}$0` // Hardcoded `0` is added here for each item
        )
        .join("#");

      setInStr(generatedString);
    } else {
      // If there are no billing details, set the string to be empty or a default value if needed.
      // Based on your previous code, setting it to an empty string might be appropriate here.
      setInStr("");
    }
  }, [billingDetails]);

  // New useEffect for fetching the logo on component mount
  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  // useEffect for fetching Corporation Code and then conditionally Latest Receipt ID
  useEffect(() => {
    const fetchCorporationCodeAndReceiptId = async () => {
      if (!OrgId) {
        console.warn(
          "User or ulbId not available. Skipping API call for corporation code."
        );
        return;
      }
      try {
        const response = await apiService.post(
          `getCorporationCode`,
          { ulbId: OrgId }
        );
        if (response.data?.data?.CODE) {
          const code = response.data.data.CODE;
          setCorporationCode(code);
          if (code === "BNCMC" || code === "BNC") {
            console.log(
              "Corporation code is BNCMC or BNC. Fetching latest receipt ID."
            );
            if (applicationIdFromParams) {
              try {
                const receiptResponse = await apiService.post(
                  `${API_BASE_URL}/getLatestReceiptId`,
                  { applicationId: applicationIdFromParams }
                );
                if (receiptResponse.data?.data?.RECIPT_ID) {
                  const receivedReceiptId = receiptResponse.data.data.RECIPT_ID;
                  setLatestReceiptId(receivedReceiptId);
                  console.log("Latest Receipt ID:", receivedReceiptId);
                  if (formikSetFieldValueRef.current) {
                    formikSetFieldValueRef.current(
                      "ReceiptIdField",
                      receivedReceiptId
                    );
                  } else {
                    console.warn("Formik setFieldValue not yet available.");
                  }
                } else {
                  console.warn(
                    "API response for latest receipt ID did not contain 'RECIPT_ID' or was empty:",
                    receiptResponse.data
                  );
                }
              } catch (receiptError) {
                console.error(
                  "Error fetching latest receipt ID:",
                  receiptError
                );
              }
            } else {
              console.warn(
                "Application ID not available to fetch latest receipt ID."
              );
            }
          } else {
            console.log(
              `Corporation code (${code}) is not BNCMC or BNC. Skipping latest receipt ID fetch.`
            );
          }
        } else {
          setCorporationCode(null);
          console.warn(
            "API response for corporation code did not contain 'data.CODE' or was empty:",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching corporation code:", error);
        setCorporationCode(null);
      }
    };
    fetchCorporationCodeAndReceiptId();
  }, [OrgId, applicationIdFromParams]);

  const handleSubmit = async (values) => {
    debugger;
    if (!values.PaymentType) {
      alert(translate("Please select Payment Mode"));
      return; // Stop the function if validation fails
    }
    const payload = {
      in_userid: userId,
      in_LICID: values.MARKETLICENSEID,
      in_LICno: values.LicenseNo,
      in_amount: parseFloat(values.Amount) || 0,
      in_receiptDt: ReciptDate ? ReciptDate.toLocaleDateString("en-GB") : null,
      in_payMode: parseFloat(values.PaymentType),
      in_BankId: values.BankName || 0,
      In_BranchName: values.BankBranchName || null,
      in_instrumentNo: values.ChequeNo || null,
      in_instrudate: ChequeDate ? ChequeDate.toLocaleDateString("en-GB") : null,
      in_remark: values.Remark,
      in_orgId: Number(OrgId), // Convert OrgId,
      in_COLLCENTERID: Number(collcenterid),
      in_mode: 1,
      in_str: inStr,
      in_payflag: values.paymentMethod === "Full Payment" ? "F" : "P",
      in_service: "MKTN",
      in_appliid: parseFloat(applicationIdFromParams),
      in_gst: 0,
      in_totamt: parseFloat(values.Amount),
    };

    console.log("Payload being sent:", payload);

    try {
      const response = await apiService.post(
        `aomk_ReceptCollection_ins`,
        payload
      );
      console.log("API Response:", response.data);

      if (response.data && response.data.message) {
        alert(response.data.message); // Display the specific message from the API
         
        if (response.data.success && response.data.receiptNo) {
          // Call handleDownloadPDF with the required data
          handleDownloadPDF({
            licId: String(values.MARKETLICENSEID), // Convert to string
            licNo: String(values.LicenseNo), // Convert to string
            corporationId: String(OrgId), // Convert to string
            recNo: String(response.data.receiptNo),
          });
        }
        navigate("/Transaction/FrmCollectionList.aspx");
      } else {
        alert("Collection submitted successfully!"); // Fallback message
        navigate("/Transaction/FrmCollectionList.aspx");
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Error submitting collection. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container mt-4">
        <Formik
          initialValues={initialFormValues}
          enableReinitialize={true} // Important to re-initialize form when initialFormValues change
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => {
            // Assign setFieldValue to the ref for external access if needed
            formikSetFieldValueRef.current = setFieldValue;

            // Effect to handle payment method changes and update Amount field and table
            useEffect(() => {
              if (values.paymentMethod === "Full Payment") {
                setFieldValue("Amount", originalTotalAmount.toString());

                // For Full Payment, Collection Amt should display the TOTALAMOUNT of each year
                const updatedBillingDetails =
                  originalBillingDetailsRef.current.map((item) => ({
                    ...item,
                    CURRENTAMOUNT: parseFloat(item.TOTALAMOUNT || 0), // Collecting the full amount due for that year
                  }));
                setBillingDetails(updatedBillingDetails);
              } else {
                // If switching to Part Payment, clear Amount textbox
                setFieldValue("Amount", "");
                // When switching to Part Payment, initially set collected amount to 0 for all years.
                // The next useEffect will then update based on the entered 'Amount'.
                const updatedBillingDetails =
                  originalBillingDetailsRef.current.map((item) => ({
                    ...item,
                    CURRENTAMOUNT: 0,
                  }));
                setBillingDetails(updatedBillingDetails);
              }
            }, [
              values.paymentMethod,
              originalTotalAmount,
              // No need for originalBillingDetailsRef.current as a direct dependency here,
              // as we are deriving from it based on paymentMethod.
              // The subsequent useEffect will handle actual distribution based on Amount.
            ]);

            // Effect to update table when Amount textbox value changes for Part Payment
            useEffect(() => {
              if (values.paymentMethod === "Part Payment") {
                let enteredAmount = parseFloat(values.Amount) || 0;
                // Create a mutable copy of the original billing details for distribution
                const tempBillingDetails = JSON.parse(
                  JSON.stringify(originalBillingDetailsRef.current)
                );

                const updatedBillingDetails = tempBillingDetails.map((item) => {
                  const outstanding = parseFloat(item.TOTALAMOUNT || 0);
                  let collectedAmountForThisYear = 0;

                  // Distribute the entered amount among outstanding years
                  if (enteredAmount > 0 && outstanding > 0) {
                    // Collect up to the outstanding amount for this year, or the remaining enteredAmount, whichever is smaller
                    collectedAmountForThisYear = Math.min(
                      enteredAmount,
                      outstanding
                    );
                    enteredAmount -= collectedAmountForThisYear; // Deduct from the total entered amount
                  }

                  return {
                    ...item,
                    CURRENTAMOUNT: collectedAmountForThisYear, // This will be the amount collected for this specific year
                  };
                });
                setBillingDetails(updatedBillingDetails);
              }
            }, [
              values.Amount,
              values.paymentMethod,
              originalBillingDetailsRef.current, // Keep this as a dependency to react to initial data load
            ]);

            return (
              <Form>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("License No.")} :`} required />
                  </div>
                  <div className="col-md-4">
                    <Field
                      name="LicenseNo"
                      component={InputField}
                      readOnly={!!LicenseNoFromParams}
                    />
                    <ErrorMessage
                      name="LicenseNo"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    {/* The "Search" button typically triggers fetching of details.
                        In your current setup, it would re-submit the form, which isn't ideal for "Search".
                        Consider separating search functionality if it's meant to fetch data independently of form submission.
                        For now, leaving it as submit, but usually a search button has a different purpose.
                    */}
                    <SaveButton type="submit" text={translate("Search")} />
                  </div>

                  {billingDetails.length > 0 && (
                    <div className="d-flex mt-4 w-100">
                      <Table
                        headers={[
                          translate("Years"),
                          translate("Outstanding Amt"),
                          translate("Collection Amt"),
                        ]}
                        data={billingDetails}
                        keyMapping={{
                          [translate("Years")]: "YEARNAME",
                          // "Outstanding Amt" always shows the TOTALAMOUNT from API
                          [translate("Outstanding Amt")]: "TOTALAMOUNT",
                          // "Collection Amt" shows the calculated collected amount for that year
                          [translate("Collection Amt")]: "CURRENTAMOUNT",
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="row mb-3 mt-4">
                  <div className="col-md-4">
                    <Label text={`${translate("मालकाचे नांव")} :`} required />

                    <Field
                      name="OwnerName"
                      component={InputField}
                      readOnly={true} // OwnerName should be read-only as it's fetched
                    />
                    <ErrorMessage
                      name="OwnerName"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("पावती दिनांक")} :`} required />
                    <CalendarIcon
                      name="ReciptDate"
                      selectedDate={ReciptDate}
                      setSelectedDate={(date) => {
                        setReciptDate(date);
                        setFieldValue("ReciptDate", date);
                      }}
                      placeholder="DD/MM/YYYY"
                      autoSelectToday="true"
                    />
                    <ErrorMessage
                      name="ReciptDate"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("देयक प्रकार")} :`} required />

                    <Field
                      name="PaymentType"
                      component={InputField}
                      type="dropdown"
                      options={payModeOptions}
                      onChange={(e) => {
                        setFieldValue("PaymentType", e.target.value);
                        // Find the selected payment mode's label
                        const selectedMode = payModeOptions.find(
                          (option) => option.value === parseInt(e.target.value)
                        );
                        // Set isCashPayment to true if the selected label is 'Cash' (case-insensitive)
                        const isCash =
                          selectedMode &&
                          selectedMode.label.toLowerCase() === "cash";
                        setIsCashPayment(isCash);

                        // If cash is selected, clear the related fields
                        if (isCash) {
                          setFieldValue("BankName", "");
                          setFieldValue("BankBranchName", "");
                          setFieldValue("ChequeNo", "");
                          setChequeDate(null); // Clear the date picker's internal state
                          setFieldValue("ChequeDate", null); // Clear Formik's value
                        }
                      }}
                    />

                    <ErrorMessage
                      name="PaymentType"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>
                <div className="row mb-3 mt-4">
                  <div className="col-md-4">
                    <Label text={`${translate("मोबाईल क्र.")} :`} required />

                    <Field
                      name="MobileNo"
                      component={InputField}
                      readOnly={true} // MobileNo should be read-only as it's fetched
                    />
                    <ErrorMessage
                      name="MobileNo"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("बॅंकेचे नांव")} :`} required />
                    <Field
                      name="BankName"
                      component={InputField}
                      type="dropdown"
                      options={bankNameOptions}
                      disabled={isCashPayment} // Disabled if cash payment
                    />
                    <ErrorMessage
                      name="BankName"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label
                      text={`${translate("बँक शाखेचे नांव")} :`}
                      required
                    />
                    <Field
                      name="BankBranchName"
                      component={InputField}
                      disabled={isCashPayment} // Disabled if cash payment
                    />
                    <ErrorMessage
                      name="BankBranchName"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                <div className="row mb-3 mt-4">
                  <div className="col-md-4">
                    <Label text={`${translate("धनादेश क्र.")} :`} required />

                    <Field
                      name="ChequeNo"
                      component={InputField}
                      disabled={isCashPayment} // Disabled if cash payment
                    />
                    <ErrorMessage
                      name="ChequeNo"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("धनादेश दिनांक")} :`} required />
                    <CalendarIcon
                      name="ChequeDate"
                      selectedDate={ChequeDate}
                      setSelectedDate={(date) => {
                        setChequeDate(date);
                        setFieldValue("ChequeDate", date);
                      }}
                      placeholder="DD/MM/YYYY"
                      autoSelectToday="true"
                      disabled={isCashPayment} // Disabled if cash payment
                    />
                    <ErrorMessage
                      name="ChequeDate"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("रक्कम")} :`} required />
                    <Field
                      name="Amount"
                      component={InputField}
                      disabled={values.paymentMethod === "Full Payment"}
                    />
                    <ErrorMessage
                      name="Amount"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>
                <div className="row mb-3 mt-4">
                  <div className="col-md-4 mt-4">
                    <Field
                      name="paymentMethod"
                      component={RadioButton}
                      label={translate("Full Payment")}
                      value="Full Payment"
                      id="fullPayment"
                      onChange={() => {
                        setFieldValue("paymentMethod", "Full Payment");
                        // This will trigger the useEffect to set the Amount and update table
                      }}
                    />
                    {/* Part Payment Radio Button */}
                    <Field
                      name="paymentMethod"
                      component={RadioButton}
                      label={translate("Part Payment")}
                      value="Part Payment"
                      id="partPayment"
                      onChange={() => {
                        setFieldValue("paymentMethod", "Part Payment");
                        // This will trigger the useEffect to clear the Amount and reset table
                      }}
                    />
                    <ErrorMessage
                      name="paymentMethod"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("शेरा ")} :`} required />
                    <Field name="Remark" component={InputField} />
                    <ErrorMessage
                      name="Remark"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
                  <SaveButton type="submit" text={translate("प्रक्रिया")} />
                  <SaveButton
                    type="button"
                    text={translate("बंद")}
                    onClick={() =>
                      navigate("/Transaction/FrmCollectionList.aspx")
                    }
                  />
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}

export default FrmCollection;
