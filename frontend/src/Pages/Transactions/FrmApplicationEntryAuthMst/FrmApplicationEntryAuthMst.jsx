import React, { useState, useEffect, useRef, useImperativeHandle } from "react"; // Added useEffect for potential API calls
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { Nav, Tab, Container } from "react-bootstrap";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import Label from "../../../Components/Label/Label"; // Adjust path as needed
import InputField from "../../../Components/InputField/InputField"; // Adjust path as needed
import CalendarIcon from "../../../Components/Calendar/CalendarIcon"; // Adjust path as needed
import SaveButton from "../../../Components/Buttons_save/Savebutton"; // Adjust path as needed
import Table from "../../../Components/Table/Table"; // Adjust path as needed
import LinkButton from "../../../Components/LinkButton/LinkButton"; // Adjust path as needed
import RadioButton from "../../../Components/RadioButton/RadioButton";
import FileUpload from "../../../Components/FileUpload/FileUpload";
import { useAuth } from "../../../Context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { ValidationSchemas } from "../../../HOC/Validation/Validation";
import useIP from "../../../Hooks/UseIp";
import config from "../../../utils/config";
import apiService from "../../../../apiService";
import { useLoader } from "../../../Context/LoaderContext";

const PrathmikMahitiTab = React.forwardRef(
  ({ UlbId, applicationId, mode, onSubmit }, ref) => {
    const { translate } = useLanguage();

    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [wardOptions, setWardOptions] = useState([]);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [loadingGeoData, setLoadingGeoData] = useState(false); // Unified loading state for zones and wards
    const [selectedZoneValue, setSelectedZoneValue] = useState(""); // Initialize with empty string for dropdown value
    const [tradeCategories, setTradeCategories] = useState([]);
    const [loadingTrades, setLoadingTrades] = useState(false);
    const [tradeTypes, setTradeTypes] = useState([]);
    const [selectedTradeTypeId, setSelectedTradeTypeId] = useState("");
    const [selectedTradeCategoryId, setSelectedTradeCategoryId] =
      useState(null);
    // This state seems unused based on the current logic for adding trades via category/type
    const [tradeRateList, setTradeRateList] = useState([]);
    const [tradeList, setTradeList] = useState([]);
    const [selectedTradeIds, setSelectedTradeIds] = useState([]); // Stores the trade IDs from the application details
    const validationSchema =
      ValidationSchemas(translate).FrmAppliVerificationMst;

    const [applicationData, setApplicationData] = useState({
      licenseNo: "",
      EngShopName: "",
      MarShopName: "",
      PanCard: "",
      ContactNo: "",
      Email: "",
      ShopAddress: "",
      WardNo: "",
      ZoneNo: "", // This will be the value Formik tracks for the dropdown
      ArrearsAmount: "",
      fromDate: null,
      toDate: null,
      amount: 0,
      TradeCategory: "",
      TradeType: "",
      Rate: "",
      isItemManufactured: "",
      isOwnBrandBusinessNo: "",
      OwnerName: "",
      OwnerAddress: "",
      AggrementType: "",
      UsedArea: "",
      YearOfCommencement: "",
      FormNo: "",
      NoObjectionCertificate: "",
      NondaniFormNo: "",
      LicenseType: "",
    });

    
    const [visitDocuments, setVisitDocuments] = useState([]);
    const [loadingVisitDocs, setLoadingVisitDocs] = useState(false);
    const [userPhoto, setUserPhoto] = useState(null);
    const [userDocument, setUserDocument] = useState(null);

    // Add this useEffect inside PrathmikMahitiTab component
    useEffect(() => {
      const fetchVisitDocuments = async () => {
        if (!applicationId || !UlbId || mode !== "2") {
          return;
        }

        setLoadingVisitDocs(true);
        try {
          const response = await apiService.post(`SiteVisitDocuments`, {
            applicationId: applicationId,
            ulbId: UlbId
          });

          console.log("Visit Documents Response:", response.data);

          if (response.data && response.data.success && Array.isArray(response.data.data)) {
            setVisitDocuments(response.data.data);
          } else {
            setVisitDocuments([]);
          }
        } catch (error) {
          console.error("Error fetching visit documents:", error);
          setVisitDocuments([]);
        } finally {
          setLoadingVisitDocs(false);
        }
      };

      fetchVisitDocuments();
    }, [applicationId, UlbId, mode]);

    // Add handleView function
    const handleViewDocument = (fileUrl) => {
      if (!fileUrl) {
        alert("File not available");
        return;
      }
      const fullUrl = fileUrl.startsWith("http") ? fileUrl : `http://localhost:5000${fileUrl}`;
      window.open(fullUrl, "_blank");
    };

    useEffect(() => {
      const fetchTradeList = async () => {
        try {
          const response = await apiService.post(`getTradeTypes`, {
            ulbId: UlbId,
          });

          if (response.data && response.data.data) {
            setTradeList(response.data.data);
          } else {
            setTradeList([]);
            alert("No trade types found.");
          }
        } catch (error) {
          console.error("Error fetching trade list:", error);
          alert("Failed to load trade list.");
          setTradeList([]);
        }
      };

      if (UlbId) fetchTradeList();
    }, [UlbId]);

    // Effect to fetch application trade details
    useEffect(() => {
      const fetchApplicationTradeDetails = async () => {
        try {
          const response = await apiService.post(
            `getApplicationTradeDetailsByAppId`,
            {
              applicationId: applicationId,
            }
          );

          if (response.data && response.data.data) {
            const tradeIds = response.data.data.map((item) =>
              String(item.NUM_APPLITRADE_TRADEID)
            );
            setSelectedTradeIds(tradeIds);
          } else {
            setSelectedTradeIds([]);
            // No alert needed here as it's common for an application to have no pre-selected trades
          }
        } catch (error) {
          console.error("Error fetching application trade details:", error);
          // No alert needed here as it's common for an application to have no pre-selected trades
          setSelectedTradeIds([]);
        }
      };

      if (applicationId) fetchApplicationTradeDetails();
    }, [applicationId]); // Re-run when applicationId changes

    const handleTradeCheckboxChange = (tradeId) => {
      setSelectedTradeIds((prevSelected) => {
        if (prevSelected.includes(tradeId)) {
          return prevSelected.filter((id) => id !== tradeId);
        } else {
          return [...prevSelected, tradeId];
        }
      });
    };

    // Create a ref for Formik to access its methods internally
    const formikRef = React.useRef();

    // Effect to fetch Zone data
    useEffect(() => {
      const fetchZoneData = async () => {
        if (!UlbId) {
          console.log("UlbId not available, skipping zone data fetch.");
          return;
        }

        setLoadingGeoData(true);
        try {
          const zoneResponse = await apiService.post(`get-zones`, {
            ulbid: UlbId,
          });

          if (zoneResponse.data && Array.isArray(zoneResponse.data)) {
            const zoneData = zoneResponse.data.map((z) => ({
              label: z.ZONENAME,
              value: String(z.ZONEID),
            }));
            setZoneOptions(zoneData);

            if (zoneData.length === 1) {
              const singleZoneValue = zoneData[0].value;
              // Set Formik's initial value for ZoneNo if only one zone
              setApplicationData((prev) => ({
                ...prev,
                ZoneNo: singleZoneValue,
              }));
              // Also set the dedicated state for zone dependency
              setSelectedZoneValue(singleZoneValue);
            } else {
              setSelectedZoneValue(""); // Or null, depending on your default dropdown behavior
            }
          } else {
            alert("No zone data found.");
            setZoneOptions([]);
            setSelectedZoneValue(""); // Clear selected zone value if no data
          }
        } catch (err) {
          console.error("Error fetching zone data:", err);
          alert("Failed to load zone data.");
          setZoneOptions([]);
          setSelectedZoneValue("");
        } finally {
          setLoadingGeoData(false);
        }
      };

      fetchZoneData();
    }, [UlbId]);

    // Effect to fetch Wards based on selectedZoneValue
    useEffect(() => {
      const fetchWardsByZone = async () => {
        if (!selectedZoneValue || !UlbId) {
          // Clear ward options and Formik field if no zone or UlbId
          formikRef.current?.setFieldValue("WardNo", "");
          setWardOptions([]);
          return;
        }

        setLoadingGeoData(true);
        try {
          const wardResponse = await apiService.post(`getWards`, {
            zoneid: selectedZoneValue,
            ulbid: UlbId, // Make sure to send ulbId as well if needed by your API
          });

          const result = wardResponse.data; // Assign response data to result

          if (result && Array.isArray(result)) {
            const wardData = result.map((w) => ({
              label: w.WARDNAME,
              value: String(w.WARDID),
            }));

            setWardOptions(wardData); // Update the options for the Ward dropdown

            if (wardData.length === 1) {
              // <-- **THIS IS THE AUTOMATIC BINDING LOGIC**
              formikRef.current?.setFieldValue("WardNo", wardData[0].value); // Set Formik's WardNo
            } else {
              formikRef.current?.setFieldValue("WardNo", ""); // Clear if no wards or multiple
            }
          } else {
            alert("No ward data found for the selected zone.");
            setWardOptions([]);
            formikRef.current?.setFieldValue("WardNo", "");
          }
        } catch (err) {
          console.error("Error fetching ward data:", err);
          alert("Failed to load ward data.");
          setWardOptions([]);
          formikRef.current?.setFieldValue("WardNo", "");
        } finally {
          setLoadingGeoData(false);
        }
      };

      fetchWardsByZone();
    }, [selectedZoneValue, UlbId]); // Dependency on selectedZoneValue and UlbId

    useEffect(() => {
      const fetchTradeCategoryData = async () => {
        if (!UlbId) return; // Exit if UlbId is not available

        setLoadingTrades(true); // Set loading for trades
        try {
          const tradeResponse = await apiService.post(
            `TradeCategory`,
            {
              org_id: UlbId, // Send as JSON
            },
            {
              headers: {
                "Content-Type": "application/json", // Use JSON header
              },
            }
          );

          if (tradeResponse.data && tradeResponse.data.data) {
            const tradeData = tradeResponse.data.data.map((t) => ({
              label: t.TRADECATEGORYNAME,
              value: String(t.TRADECATEGORYID),
            }));
            setTradeCategories(tradeData); // Use your state function
          } else {
            alert("No trade category data found.");
            setTradeCategories([]);
          }
        } catch (err) {
          console.error("Error fetching trade category data:", err);
          alert("Failed to load trade category data.");
        } finally {
          setLoadingTrades(false); // Unset loading for trades
        }
      };

      fetchTradeCategoryData();
    }, [UlbId]); // Dependency: UlbId for trade category data

    useEffect(() => {
      const fetchTradeTypes = async () => {
        if (!selectedTradeCategoryId || !UlbId) {
          setTradeTypes([]);
          return;
        }

        try {
          const response = await apiService.post(
            `getTradeTypesByCategory`,
            {
              tradeCategoryId: selectedTradeCategoryId,
              ulbId: UlbId,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data && response.data.data) {
            const mappedTypes = response.data.data.map((type) => ({
              label: type.NUM_RATE_TRADETYPENAME,
              value: String(type.TRADETYPEID),
            }));
            setTradeTypes(mappedTypes);
          } else {
            setTradeTypes([]);
            alert("No trade types found for this category.");
          }
        } catch (error) {
          console.error("Error fetching trade types:", error);
          alert("Failed to load trade types.");
          setTradeTypes([]);
        }
      };

      fetchTradeTypes();
    }, [selectedTradeCategoryId, UlbId]);

    const handleAddTradeRateToList = (values, setFieldValue) => {
      const { TradeType, Rate } = values; // Get values from Formik's state

      if (!TradeType || !Rate) {
        alert("Please fill both Trade Type and Rate.");
        return;
      }

      const existing = tradeRateList.find(
        (item) => String(item.tradeTypeId) === String(TradeType)
      );
      if (existing) {
        alert("Trade type already exists in the list.");
        return;
      }

      const tradeTypeName =
        tradeTypes.find((t) => String(t.value) === String(TradeType))?.label ||
        "";

      const newEntry = {
        tradeTypeId: TradeType,
        tradeTypeName,
        rate: parseFloat(Rate) || 0, // Ensure rate is a number
      };

      setTradeRateList((prev) => [...prev, newEntry]);

      // ************* CRITICAL FIX: Reset these specific Formik fields *************
      setFieldValue("TradeCategory", ""); // Clear the selected trade category in Formik
      setFieldValue("TradeType", ""); // Clear the selected trade type in Formik
      setFieldValue("Rate", ""); // Clear the rate in Formik

      // ************* Also reset the local state controlling the dropdowns *************
      setSelectedTradeCategoryId(null); // Reset the local state for Trade Category dropdown
      setSelectedTradeTypeId(""); // Reset the local state for Trade Type dropdown

      // Update the total amount in Formik's state
      // Calculate the new total based on the updated tradeRateList
      const newTotalAmount = [...tradeRateList, newEntry].reduce(
        (sum, item) => sum + parseFloat(item.rate || 0),
        0
      );
      setFieldValue("amount", newTotalAmount); // Update Formik's 'amount' field
    };

    const handleRemoveTradeRate = (index, setFieldValue) => {
      setTradeRateList((prev) => {
        const updatedList = prev.filter((_, i) => i !== index);
        // Recalculate amount after removal
        const newTotalAmount = updatedList.reduce(
          (sum, item) => sum + parseFloat(item.rate || 0),
          0
        );
        setFieldValue("amount", newTotalAmount); // Update Formik's 'amount' field
        return updatedList;
      });
    };
    useEffect(() => {
      if (applicationId && UlbId) {
        apiService
          .post(`getAppliTradeTypeDetails`, {
            applicationId,
            ulbId: UlbId,
          })
          .then((response) => {
            const fetchedTradeRateList = response.data?.data || [];
            const formattedTradeRateList = fetchedTradeRateList.map((item) => ({
              tradeTypeId: item.TRADETYPEID,
              tradeTypeName: item.TRADETYPENAME,
              rate: item.RATE,
            }));
            setTradeRateList(formattedTradeRateList); // Set the tradeRateList

          })
          .catch((error) => {
            console.error("Error fetching trade type details:", error);
          });
      }
    }, [applicationId, UlbId]);

    useEffect(() => {
      if (applicationId && UlbId) {
        console.log(
          "Fetching application data for applicationId:",
          applicationId,
          "and ulbId:",
          UlbId
        );
        apiService
          .post(`get-application-details`, {
            AppliList_AppId: applicationId,
            OrgId: UlbId,
          })
          .then((response) => {
            const data = response.data;
            if (data) {
              const fetchedFromDate = data.DAT_APPLI_FROMDT
                ? new Date(data.DAT_APPLI_FROMDT)
                : null;
              const fetchedToDate = data.DAT_APPLI_TODT
                ? new Date(data.DAT_APPLI_TODT)
                : null;

              setApplicationData((prevData) => ({
                ...prevData,
                licenseNo: data.VAR_APPLI_OLDLICENCNO || "",
                EngShopName: data.VAR_APPLI_SHOPNAME || "",
                MarShopName: data.VAR_APPLI_SHOPNAMEMAR || "",
                PanCard: data.VAR_APPLI_PANNO || "",
                ContactNo: data.NUM_APPLI_CONTACTNO || "",
                Email: data.VAR_APPLI_EMAIL || "",
                ShopAddress: data.VAR_APPLI_ADDRESS || "",
                WardNo: data.NUM_APPLI_WARDID || "",
                ZoneNo: data.NUM_APPLI_ZONEID || "",
                ArrearsAmount: data.ARREASAMT || 0,
                fromDate: fetchedFromDate, // Set in applicationData for Formik initialValues
                toDate: fetchedToDate, // Set in applicationData for Formik initialValues
                amount: data.AMOUNT || 0,
                isItemManufactured:
                  data.VAR_APPLI_ISPROD === "Y" ? "yes" : "no",
                isOwnBrandBusinessNo:
                  data.VAR_APPLI_OWNSPACE === "Y" ? "yes" : "no",
                OwnerName: data.VAR_APPLI_PLACEOWNERNAME || "",
                OwnerAddress: data.VAR_APPLI_PLACEOWNERADDRESS || "",
                AggrementType: data.VAR_APPLI_AGRMENTWITH || "",
                UsedArea: data.NUM_APPLI_AREA || "",
                YearOfCommencement: data.NUM_APPLI_BUSSTARTYR || "",
                FormNo: data.VAR_APPLI_SHOPACTNO || "",
                NoObjectionCertificate:
                  data.VAR_APPLI_ISCORPNOC === "Y" ? "yes" : "no",
                NondaniFormNo: data.VAR_APPLI_FOODLICNO || "",
              }));

              // *** CRITICAL ADDITION: Update local state for CalendarIcon as well ***
              setFromDate(fetchedFromDate);
              setToDate(fetchedToDate);

              // **Important**: If ZoneNo and WardNo are fetched, set the selectedZoneValue
              // to trigger the ward fetch, and set WardNo in Formik's state.
              if (data.NUM_APPLI_ZONEID) {
                setSelectedZoneValue(String(data.NUM_APPLI_ZONEID));
              }
            }
          })
          .catch((error) => {
            console.error("Error fetching application details:", error);
          });
      }
    }, [applicationId, UlbId]);

    useEffect(() => {
      console.log('Application Data');
    }, [applicationData])

    // useImperativeHandle allows you to customize the ref handle exposed to parent components.
    // Here, we expose a submitForm function that triggers Formik's submission.
    useImperativeHandle(ref, () => ({
      submit: () => {
        // Access the FormikBag (formikProps) and call submitForm
        // This will trigger the onSubmit handler within Formik below
        formikRef.current?.submitForm();
      },
      // You can also expose the current values if needed
      getValues: () => formikRef.current?.values,
      // You might also want to expose validation status
      isValid: () => formikRef.current?.isValid,
      // Expose tradeRateList and selectedTradeIds
      getTradeRateList: () => tradeRateList,
      getSelectedTradeIds: () => selectedTradeIds,
      getUserPhoto: () => userPhoto, 
      getUserDocument: () => userDocument,
    }));

    const In_Applitradetype_Str = tradeRateList
      .map((item) => `${item.tradeTypeId}$${item.rate}`)
      .join("#"); // THIS IS THE LINE YOU ALREADY HAVE AND IS CORRECT
    const In_Applitrade_Str = selectedTradeIds.join("#");

    return (
      <Formik
        enableReinitialize={true}
        initialValues={applicationData}
        ValidationSchemas={validationSchema}
        innerRef={formikRef} // Attach the innerRef to Formik
        onSubmit={(values, { setSubmitting }) => {
          // This is Formik's onSubmit. When triggered, it will log values.
          console.log("Formik values:", values);
          console.log("Trade Rate List (from state):", tradeRateList);
          console.log("Selected Trade IDs (from state):", selectedTradeIds);

          // If you still want to pass this up to a general onSubmit prop
          // for `PrathmikMahitiTab`, you can do so, but the ref approach
          // gives the parent more direct control over submission.
          // If onSubmit prop is not defined by parent it will not cause error.
          onSubmit && onSubmit(values, tradeRateList, selectedTradeIds);

          setSubmitting(false); // Reset submitting state
        }}
      >
        {({ setFieldValue, values, errors, touched }) => (
          <Form>
            {/* First Row: License No. & Old License No. */}
            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label
                  text={`${translate(
                    "परवाना क्रमांक किंवा परवाना धारक किंवा नोंदणी क्रमांक"
                  )} :`}
                />
                <Field
                  name="licenseNo"
                  component={InputField}
                  className={`form-control ${
                    errors.licenseNo && touched.licenseNo ? "is-invalid" : ""
                  }`}
                  type="text"
                />
                <ErrorMessage
                  name="licenseNo"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("दुकानाचे नाव इंग्रजी")} :`} />
                <Field
                  name="EngShopName"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="EngShopName"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("दुकानाचे नाव मराठी")} :`} />
                <Field
                  name="MarShopName"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="MarShopName"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>

            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label text={`${translate("पॅनकार्ड")} :`} required />
                <Field
                  name="PanCard"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="PanCard"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("संपर्क क्र.")} :`} required />
                <Field
                  name="ContactNo"
                  component={InputField}
                  className="form-control"
                  type="tel"
                />
                <ErrorMessage
                  name="ContactNo"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("ई-मेल")} :`} required />
                <Field
                  name="Email"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="Email"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>

            <div className="row mb-3 ">
              <div className="col-md-4">
                <Label text={`${translate("दुकानाचा पत्ता")} :`} required />
                <Field
                  name="ShopAddress"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="ShopAddress"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("झोन क्र.")} :`} required />
                <Field
                  name="ZoneNo"
                  component={InputField}
                  className="form-control"
                  type="dropdown"
                  options={zoneOptions}
                  onChange={(e) => {
                    const selectedZoneId = e.target.value;
                    setFieldValue("ZoneNo", selectedZoneId); // Update Formik's state for Zone
                    setSelectedZoneValue(selectedZoneId); // <-- This triggers the ward fetch!

                    setFieldValue("WardNo", ""); // Clear previous Ward selection in Formik
                    setWardOptions([]); // Clear ward options list
                  }}
                />

                <ErrorMessage
                  name="ZoneNo"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("वार्ड क्र.")} :`} required />
                <Field
                  name="WardNo"
                  component={InputField}
                  className="form-control"
                  type="dropdown"
                  options={wardOptions}
                  // Update state on change - Formik will handle its own state update for WardNo
                />
                <ErrorMessage
                  name="WardNo"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>

            {/* Sixth Row: From Date, To Date, Amount */}
            <div className="row mb-3">
              <div className="col-md-4">
                <Label text={`${translate("Arrears Amount")} :`} required />
                <Field
                  name="ArrearsAmount"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="ArrearsAmount"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("दिनांक पासून")} :`} required />
                <CalendarIcon
                  name="fromDate"
                  selectedDate={fromDate}
                  setSelectedDate={(date) => {
                    setFromDate(date);
                    setFieldValue("fromDate", date);
                  }}
                  placeholder="DD/MM/YYYY"
                  autoSelectToday={false}
                  className={`${
                    errors.fromDate && touched.fromDate ? "is-invalid" : ""
                  }`}
                />
                <ErrorMessage
                  name="fromDate"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("दिनांक पर्यंत")} :`} required />
                <CalendarIcon
                  name="toDate"
                  selectedDate={toDate}
                  setSelectedDate={(date) => {
                    setToDate(date);
                    setFieldValue("toDate", date);
                  }}
                  placeholder="DD/MM/YYYY"
                  autoSelectToday={false}
                />
                <ErrorMessage
                  name="toDate"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4">
                <Label text={`${translate("रक्कम")} :`} required />
                <Field
                  name="amount"
                  component={InputField}
                  type="number"
                  placeholder={translate("रक्कम")}
                />
                <ErrorMessage
                  name="amount"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="col-md-4">
                <Label text={`${translate("Trade Category ")} :`} required />
                <Field
                  name="TradeCategory"
                  component={InputField}
                  className="form-control"
                  type="dropdown"
                  options={tradeCategories}
                  onChange={(e) => {
                    setSelectedTradeCategoryId(e.target.value); // Update local state for fetching trade types
                    setFieldValue("TradeCategory", e.target.value); // Update Formik's state
                    setFieldValue("TradeType", ""); // Clear TradeType when category changes
                    setFieldValue("Rate", ""); // Clear Rate when category changes
                    setTradeTypes([]); // Clear trade types immediately
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
                  options={tradeTypes}
                  placeholder="Select Trade Type"
                  onChange={async (e) => {
                    const value = e.target.value;
                    setSelectedTradeTypeId(value); // Update local state for rate fetching
                    setFieldValue("TradeType", value); // Update Formik's state

                    if (selectedTradeCategoryId && value && UlbId) {
                      try {
                        const response = await apiService.post(
                          `getSpecificTradeRate`,
                          {
                            ulbId: UlbId,
                            tradeTypeId: value,
                            tradeCategoryId: selectedTradeCategoryId,
                          }
                        );

                        const rate = response.data?.data?.TRADERATE;

                        if (rate) {
                          setFieldValue("Rate", rate); // Set the rate directly in Formik
                        } else {
                          setFieldValue("Rate", "");
                          alert("No rate found for this combination.");
                        }
                      } catch (error) {
                        console.error("Error fetching trade rate:", error);
                        setFieldValue("Rate", "");
                      }
                    }
                  }}
                />
                <ErrorMessage
                  name="TradeType"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>
            <div className="row mb-3 align-items-end">
              {" "}
              {/* Added align-items-end to align items at the bottom */}
              <div className="col-md-4">
                <Label text={`${translate("Rate")} :`} required />
                <Field
                  name="Rate"
                  component={InputField}
                  type="number"
                  placeholder={translate("रक्कम")}
                />
                <ErrorMessage
                  name="Rate"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                {" "}
                <SaveButton
                  type="button"
                  text={translate("Add To List")}
                  onClick={() =>
                    handleAddTradeRateToList(values, setFieldValue)
                  }
                />{" "}
              </div>
            </div>

            <div className="row mb-4">
              <div style={{ display: "flex", gap: "20px" }}>
                {/* Added a flex container with gap */}
                <div className="col-md-6">
                  <div className="table-container mt-4">
                    <div className="table-Box-1">
                      <Table
                        headers={[
                          translate("काढा"),
                          translate("व्यवसायाचे स्वरूप"),
                          translate("दर"),
                        ]}
                        data={tradeRateList.map((item, index) => ({
                          remove: (
                            <LinkButton
                              onClick={() =>
                                handleRemoveTradeRate(index, setFieldValue)
                              } // Pass setFieldValue to remove handler
                              text={translate("Remove")}
                            />
                          ),
                          tradeType: item.tradeTypeName,
                          rate: item.rate,
                        }))}
                        keyMapping={{
                          [translate("काढा")]: "remove",
                          [translate("व्यवसायाचे स्वरूप")]: "tradeType",
                          [translate("दर")]: "rate",
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="table-container mt-4">
                    <div className="table-Box-1">
                      <Table
                        headers={[
                          translate("निवडा"),
                          translate("व्यवसायाचे प्रकार"),
                        ]}
                        data={tradeList.map((trade) => ({
                          checkbox: (
                            <input
                              type="checkbox"
                              value={trade.TRADEID}
                              checked={selectedTradeIds.includes(
                                String(trade.TRADEID)
                              )}
                              onChange={() =>
                                handleTradeCheckboxChange(String(trade.TRADEID))
                              }
                            />
                          ),
                          tradeName: trade.TRADENAME,
                        }))}
                        keyMapping={{
                          [translate("निवडा")]: "checkbox",
                          [translate("व्यवसायाचे प्रकार")]: "tradeName",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <div className="row mb-3 align-items-center">
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="col-md-5">
                    <Label text={`${translate("वस्तू निर्मित आहे का")} :`} />
                  </div>
                  <div className="d-flex gap-3 mt-1">
                    <Field
                      name="isItemManufactured"
                      component={RadioButton}
                      label={translate("होय")}
                      value="yes"
                      id="isItemManufacturedYes"
                    />
                    <Field
                      name="isItemManufactured"
                      component={RadioButton}
                      label={translate("नाही")}
                      value="no"
                      id="isItemManufacturedNo"
                    />
                  </div>
                </div>
                <ErrorMessage
                  name="isItemManufactured"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="col-md-11">
                    <Label
                      text={`${translate(
                        "   स्वते चे: मालकीचे जागेत व्यवसाय करीत आहे का"
                      )} :`}
                    />
                  </div>
                  <div className="d-flex gap-3 mt-1">
                    <Field
                      name="isOwnBrandBusinessNo"
                      component={RadioButton}
                      label={translate("होय")}
                      value="yes"
                      id="isOwnBrandBusinessNo"
                    />
                    <Field
                      name="isOwnBrandBusinessNo"
                      component={RadioButton}
                      label={translate("नाही")}
                      value="no"
                      id="isOwnBrandBusinessNo"
                    />
                  </div>
                </div>
                <ErrorMessage
                  name="isOwnBrandBusiness"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>

            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label text={`${translate("जागा मालकाचे नाव")} :`} required />
                <Field
                  name="OwnerName"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="OwnerName"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("जागा मालकाचा पत्ता")} :`} required />
                <Field
                  name="OwnerAddress"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="OwnerAddress"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label
                  text={`${translate("भाडे करार कोणासोबत केलेला आहे")} :`}
                  required
                />
                <Field
                  name="AggrementType"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="AggrementType"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>

            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label
                  text={`${translate(
                    "वापरात असलेले जागेचे क्षेत्र चौ. फुट मध्ये"
                  )} :`}
                  required
                />
                <Field
                  name="UsedArea"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="UsedArea"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label
                  text={`${translate("व्यवसाय सुरु केल्याचे वर्ष")} :`}
                  required
                />
                <Field
                  name="YearOfCommencement"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="YearOfCommencement"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label
                  text={`${translate("शॉप ऍक्ट नोंदणी क्र.")} :`}
                  required
                />
                <Field
                  name="FormNo"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="FormNo"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>

            <div className="row mb-3 align-items-center">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-3">
                  <div className="col-md-7">
                    <Label
                      text={`${translate(
                        "व्यवसायासाठी म. न. पा. चे नाहरकत प्रमाणपत्र घेतले आहे का"
                      )} :`}
                    />
                  </div>
                  <div className="d-flex gap-3 mt-1">
                    <Field
                      name="NoObjectionCertificate"
                      component={RadioButton}
                      label={translate("होय")}
                      value="yes"
                      id="NoObjectionCertificate"
                    />
                    <Field
                      name="NoObjectionCertificate"
                      component={RadioButton}
                      label={translate("नाही")}
                      value="no"
                      id="NoObjectionCertificate"
                    />
                  </div>
                </div>
                <ErrorMessage
                  name="NoObjectionCertificate"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label
                  text={`${translate(
                    "अन्न व औषध प्रशासन कायद्यान्वये नोंदणी क्र."
                  )} :`}
                  required
                />
                <Field
                  name="NondaniFormNo"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="NondaniFormNo"
                  component="div"
                  className="text-danger"
                />
              </div>
            </div>
            

            {mode == "1" && (
              <div className="row mb-3 align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ minWidth: "150px" }}>
                      <Label
                        text={`${translate("अर्जदाराचा फोटो")} :`}
                        required
                      />
                    </div>

                    <div>
                      <FileUpload 
                        name="userPhoto" 
                        setFieldValue={setFieldValue}
                        accept=".jpg,.jpeg,.png"
                        onChange={(fileOrEvent) => {
                          const file = fileOrEvent?.target?.files?.[0] || fileOrEvent;
                          
                          if (file && file instanceof File) {
                            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                            if (!validTypes.includes(file.type)) {
                              alert(translate("कृपया फक्त JPG, JPEG किंवा PNG फोटो अपलोड करा."));
                              setUserPhoto(null);
                              setFieldValue("userPhoto", null);
                              return;
                            }
                            setUserPhoto(file);
                            setFieldValue("userPhoto", file);
                          }
                        }}
                      />
                    </div>

                    {/* Image Preview */}
                    <div>
                      {values.userPhoto ? (
                        <img
                          src={URL.createObjectURL(values.userPhoto)}
                          alt="Applicant"
                          style={{
                            width: "80px",
                            height: "80px",
                            border: "1px solid #ccc",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "80px",
                            height: "80px",
                            border: "1px solid #ccc",
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <ErrorMessage
                    name="userPhoto"
                    component="div"
                    className="text-danger mt-1"
                  />
                </div>

                <div className="col-md-6">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ minWidth: "120px" }}>
                      <Label
                        text={`${translate("Document")} :`}
                        required
                      />
                    </div>

                    <div>
                      <input
                        type="file"
                        id="userDocumentInput"
                        name="userDocument"
                        accept=".pdf,application/pdf"
                        className="form-control"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          
                          if (file) {
                            const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                            if (!isPDF) {
                              alert(translate("कृपया फक्त PDF फाइल अपलोड करा."));
                              e.target.value = ''; 
                              setUserDocument(null);
                              setFieldValue("userDocument", null);
                              return;
                            }
                            
                            if (file.size > 2 * 1024 * 1024) {
                              alert(translate("PDF फाइलचा आकार 2 MB पेक्षा जास्त नसावा."));
                              e.target.value = ''; 
                              setUserDocument(null);
                              setFieldValue("userDocument", null);
                              return;
                            }
                            
                            setUserDocument(file);
                            setFieldValue("userDocument", file);
                          }
                        }}
                      />
                    </div>

                    <div>
                      {values.userDocument ? (
                        <span>{values.userDocument.name}</span>
                      ) : (
                        <span>No file chosen</span>
                      )}
                    </div>
                  </div>

                  <ErrorMessage
                    name="userDocument"
                    component="div"
                    className="text-danger mt-1"
                  />
                </div>
              </div>
            )}

            {mode == "2" && (
              <div className="row mb-3">
                <div className="col-12">
                  <div className="table-container mt-2">
                    <div className="table-Box-1">
                      {loadingVisitDocs ? (
                        <p className="text-center">{translate("Loading...")}</p>
                      ) : visitDocuments.length > 0 ? (
                        <Table
                          headers={[
                            translate("दस्तावेजाचे नांव"),
                            translate("View")
                          ]}
                          data={visitDocuments.map((doc) => ({
                            [translate("दस्तावेजाचे नांव")]: doc.documentTypeName || "",
                            [translate("View")]: (
                              <LinkButton
                                text={translate("View")}
                                onClick={() => handleViewDocument(doc.fileUrl)}
                              />
                            )
                          }))}
                          keyMapping={{
                            [translate("दस्तावेजाचे नांव")]: translate("दस्तावेजाचे नांव"),
                            [translate("View")]: translate("View")
                          }}
                        />
                      ) : (
                        <p className="text-center">{translate("No visit documents found.")}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <hr />
          </Form>
        )}
      </Formik>
    );
  }
);

const SanchalakMahitiTab = React.forwardRef(
  ({ UlbId, applicationId, onSubmit }, ref) => {
    const { translate } = useLanguage();

    console.log(
      "SanchalakMahitiTab - Component Mounted/Rendered. UlbId:",
      UlbId,
      "Application ID:",
      applicationId
    );

    const [applicationTypes, setApplicationTypes] = useState([]);
    const [directorList, setDirectorList] = useState([]);
    const validationSchema =
      ValidationSchemas(translate).FrmAppliVerificationMst;

    // Ref to hold Formik's internal methods
    const formikRef = useRef();

    // Expose methods to the parent component via the ref
    useImperativeHandle(ref, () => ({
      submit: () => {
        console.log("SanchalakMahitiTab - submit() called via ref.");
        formikRef.current?.submitForm();
      },
      getValues: () => formikRef.current?.values,
      isValid: () => formikRef.current?.isValid,
      getDirectorList: () => {
        console.log(
          "SanchalakMahitiTab - getDirectorList() called, returning:",
          directorList
        );
        return directorList;
      },
      resetForm: () => {
        formikRef.current?.resetForm();
      },
    }));

    // Effect to fetch application types (runs once when UlbId is available)
    useEffect(() => {
      const fetchApplicationTypes = async () => {
        try {
          const response = await apiService.post(
            `getApplicationTypes`,
            {
              ulbId: UlbId,
            }
          );

          if (response.data && Array.isArray(response.data.data)) {
            const mapped = response.data.data.map((type) => ({
              label: type.APPLICATIONTYPENAME,
              value: type.APPLICATIONTYPEID.toString(),
            }));
            setApplicationTypes(mapped);
            console.log(
              "SanchalakMahitiTab - Fetched application types:",
              mapped
            );
          } else {
            console.warn(
              "SanchalakMahitiTab - No application type data received or invalid format.",
              response.data
            );
            setApplicationTypes([]);
          }
        } catch (error) {
          console.error(
            "SanchalakMahitiTab - Error fetching application types:",
            error
          );
          setApplicationTypes([]);
        }
      };

      if (UlbId) {
        fetchApplicationTypes();
      }
    }, [UlbId]);

    // Effect to fetch existing director details (runs when applicationId is available/changes)
    useEffect(() => {
      const fetchDirectorDetails = async () => {
        console.log(
          "SanchalakMahitiTab - fetchDirectorDetails triggered. Current applicationId:",
          applicationId
        );
        if (!applicationId) {
          console.warn(
            "SanchalakMahitiTab - No applicationId provided, skipping director details fetch."
          );
          setDirectorList([]);
          return;
        }

        try {
          const response = await apiService.post(
            `getDirectorDetailsWithApplicationId`,
            {
              applicationId: applicationId,
            }
          );

          if (response.data && Array.isArray(response.data.data)) {
            // --- START FIX ---
            // Fetch and convert image URL to a File object for existing directors
            const directorsWithPhotos = await Promise.all(
              response.data.data.map(async (director) => {
                let photoFile = null;
                // If a directorImage URL is provided, fetch the image as a Blob and create a File object
                if (director.directorImage) {
                  const imageUrl = `${API_BASE_URL}${director.directorImage}`;
                  try {
                    const imageResponse = await axios.get(imageUrl, {
                      responseType: "blob",
                    });
                    // Create a File object from the Blob
                    photoFile = new File(
                      [imageResponse.data],
                      director.directorImage.split("/").pop() ||
                        "director_photo.png", // Use filename from URL, with fallback
                      { type: imageResponse.data.type || "image/png" } // Use the actual MIME type from the response, with fallback
                    );
                    console.log(
                      `Successfully created File object for director: ${director.DIRCTORNAME}`,
                      photoFile
                    );
                  } catch (imageError) {
                    console.error(
                      `Error fetching or creating File for photo at URL ${imageUrl}:`,
                      imageError
                    );
                    // Keep photoFile as null if fetching fails
                  }
                }

                // Return the director data with the new _photoFile property
                return {
                  ...director,
                  _photoFile: photoFile, // This is the key fix: store the File object
                };
              })
            );

            setDirectorList(directorsWithPhotos);
            console.log(
              "SanchalakMahitiTab - Successfully fetched and processed existing director data:",
              directorsWithPhotos
            );
            // --- END FIX ---
          } else {
            setDirectorList([]);
            console.warn(
              "SanchalakMahitiTab - No director details data received or invalid format for application ID:",
              applicationId,
              response.data
            );
          }
        } catch (error) {
          console.error(
            "SanchalakMahitiTab - Error fetching director details:",
            error
          );
          setDirectorList([]);
        }
      };

      fetchDirectorDetails();
    }, [applicationId]);

    // Log directorList state changes for debugging
    useEffect(() => {
      console.log(
        "SanchalakMahitiTab - directorList state updated. Current list:",
        directorList
      );
      // Check if _photoFile exists on each director in the list
      directorList.forEach((director, index) => {
        console.log(
          `Director at index ${index} has _photoFile:`,
          director._photoFile
        );
      });
    }, [directorList]);

    const initialValues = {
      AAdharNo: "",
      SanchalakName: "",
      LicenseNo: "",
      ContactNo: "",
      Email: "",
      Gender: "F",
      Address: "",
      ApplicantType: "",
      directorPhoto: null,
    };

    const handleAddDirector = async (values, formikBag) => {
      const { resetForm, setFieldValue, validateForm, setTouched } = formikBag;

      console.log("handleAddDirector triggered.");
      console.log("Current Formik values:", values);
      console.log("File object from values:", values.directorPhoto);

      // Manually trigger validation to check all fields
      const errors = await validateForm(values);
      await setTouched(
        Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );

      if (Object.keys(errors).length > 0) {
        console.log("Form validation failed. Errors:", errors);
        alert(translate("कृपया फॉर्ममधील त्रुटी दुरुस्त करा."));
        return;
      }

      // Manual check for directorPhoto
      if (!values.directorPhoto) {
        alert(translate("कृपया संचालकांचा फोटो अपलोड करा."));
        return;
      }

      const selectedApplicantType = applicationTypes.find(
        (type) => type.value === values.ApplicantType
      );
      const applicantTypeName = selectedApplicantType
        ? selectedApplicantType.label
        : "";

      // Assign a unique ID for new directors added in the UI
      const newDirectorId =
        directorList.length > 0
          ? Math.max(...directorList.map((d) => d.DIRECTORID)) + 1
          : 1;

      const newDirector = {
        DIRECTORID: newDirectorId,
        ADHARNO: values.AAdharNo,
        DIRCTORNAME: values.SanchalakName,
        VOTERID: values.LicenseNo,
        MOBILENO: values.ContactNo,
        EMAIL: values.Email,
        GENDER: values.Gender,
        ADDRESS: values.Address,
        APPLITYPEID: values.ApplicantType,
        APPLITYPENAME: applicantTypeName,
        // Create URL for display immediately
        directorImage: values.directorPhoto
          ? URL.createObjectURL(values.directorPhoto)
          : null,
        _photoFile: values.directorPhoto, // Store the actual File object temporarily
      };

      console.log("New director object created to be added:", newDirector);

      // Add to local list first (optimistic UI update)
      setDirectorList((prevList) => {
        const newList = [...prevList, newDirector];
        console.log(
          "Director added to local state. New list size:",
          newList.length
        );
        return newList;
      });

      // Reset Formik form fields
      resetForm({ values: initialValues }); // Use initialValues to reset all fields
      console.log("Form reset successful.");
    };

    const handleDeleteDirector = (directorIdToDelete) => {
      console.log(
        "SanchalakMahitiTab - Deleting director with ID:",
        directorIdToDelete
      );
      setDirectorList((prevList) => {
        const newList = prevList.filter(
          (d) => d.DIRECTORID !== directorIdToDelete
        );
        console.log(
          "SanchalakMahitiTab - directorList state after delete:",
          newList
        );
        return newList;
      });
      // TODO: If you want to delete from backend, add API call here
    };

    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        innerRef={formikRef}
        validationSchema={validationSchema}
        onSubmit={(_, { setSubmitting }) => {
          console.log("Formik onSubmit called.");
          if (onSubmit) {
            onSubmit(directorList); // Pass the current directorList to the parent
          }
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue, resetForm, validateForm, setTouched }) => (
          <Form>
            {/* Form Fields for adding a single director */}
            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label
                  text={`${translate("संचालकांचा आधार क्रमांक")} :`}
                  required
                />
                <Field
                  name="AAdharNo"
                  component={InputField}
                  className="form-control"
                  type="tel"
                />
                <ErrorMessage
                  name="AAdharNo" // Corrected name to match field
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("संचालकांचा नाव")} :`} required />
                <Field
                  name="SanchalakName"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="SanchalakName"
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
              <div className="col-md-4">
                <Label
                  text={`${translate("Voter ID Card No / License No")} :`}
                  required
                />
                <Field
                  name="LicenseNo"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="LicenseNo"
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
            </div>
            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label text={`${translate("संपर्क क्र.")} :`} required />
                <Field
                  name="ContactNo"
                  component={InputField}
                  className="form-control"
                  type="tel"
                />
                <ErrorMessage
                  name="ContactNo"
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("ई-मेल")} :`} required />
                <Field
                  name="Email"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="Email"
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
              <div className="col-md-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="col-md-2 mt-4">
                    <Label text={`${translate("लिंग")} :`} />
                  </div>
                  <div className="d-flex gap-3 mt-4">
                    <Field
                      name="Gender"
                      component={RadioButton}
                      label={translate("स्त्री")}
                      value="F"
                      id="genderFemale"
                      checked={values.Gender === "F"}
                    />
                    <Field
                      name="Gender"
                      component={RadioButton}
                      label={translate("पुरुष")}
                      value="M"
                      id="genderMale"
                      checked={values.Gender === "M"}
                    />
                    <Field
                      name="Gender"
                      component={RadioButton}
                      label={translate("इतर")}
                      value="O"
                      id="genderOther"
                      checked={values.Gender === "O"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label text={`${translate("पत्ता")} :`} required />
                <Field
                  name="Address"
                  component={InputField}
                  className="form-control"
                  type="text"
                />
                <ErrorMessage
                  name="Address"
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("अर्जदार प्रकार")} :`} required />
                <Field
                  name="ApplicantType"
                  component={InputField}
                  className="form-control"
                  type="dropdown"
                  options={applicationTypes}
                />
                <ErrorMessage
                  name="ApplicantType"
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("संचालकाचां फोटो")} :`} required />
                <FileUpload
                  name="directorPhoto"
                  setFieldValue={setFieldValue}
                />
                <ErrorMessage
                  name="directorPhoto"
                  component="div"
                  className="text-danger mt-1"
                />
              </div>
            </div>
            <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
              <SaveButton
                type="button"
                text={translate("Add Director")}
                onClick={() =>
                  handleAddDirector(values, {
                    setFieldValue,
                    resetForm,
                    validateForm,
                    setTouched,
                  })
                }
              />
            </div>

            {/* Table Section */}
            {directorList.length > 0 ? (
              <div className="certi_change_table mt-4">
                <Table
                  headers={[
                    translate("आधार क्र."),
                    translate("संचालकांचे नांव"),
                    translate("Voter ID Card No / License No"),
                    translate("मोबाईल क्र."),
                    translate("ई-मेल"),
                    translate("लिंग"),
                    translate("पत्ता"),
                    translate("अर्जदाराचा प्रकार"),
                    translate("संचालकांचे छायाचित्र"),
                    translate("काडा"), // Delete action column
                  ]}
                  data={directorList.map((director) => ({
                    [translate("आधार क्र.")]: director.ADHARNO,
                    [translate("संचालकांचे नांव")]: director.DIRCTORNAME,
                    [translate("Voter ID Card No / License No")]:
                      director.VOTERID,
                    [translate("मोबाईल क्र.")]: director.MOBILENO,
                    [translate("ई-मेल")]: director.EMAIL,
                    [translate("लिंग")]: director.GENDER,
                    [translate("पत्ता")]: director.ADDRESS,
                    [translate("अर्जदाराचा प्रकार")]: director.APPLITYPENAME,
                    [translate("संचालकांचे छायाचित्र")]: (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          height: "100%",
                        }}
                      >
                        <img
                          src={
                            director.directorImage &&
                            director.directorImage.startsWith("blob:")
                              ? director.directorImage // For newly added, client-side blob URL
                              : director.directorImage
                              ? `${API_BASE_URL}${director.directorImage}` // For existing, server path
                              : "https://via.placeholder.com/60" // Default placeholder image
                          }
                          alt="Director Photo"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                    ),
                    [translate("काडा")]: (
                      <LinkButton
                        text={translate("Delete")}
                        onClick={() =>
                          handleDeleteDirector(director.DIRECTORID)
                        }
                      />
                    ),
                  }))}
                  keyMapping={{
                    [translate("आधार क्र.")]: translate("आधार क्र."),
                    [translate("संचालकांचे नांव")]:
                      translate("संचालकांचे नांव"),
                    [translate("Voter ID Card No / License No")]: translate(
                      "Voter ID Card No / License No"
                    ),
                    [translate("मोबाईल क्र.")]: translate("मोबाईल क्र."),
                    [translate("ई-मेल")]: translate("ई-मेल"),
                    [translate("लिंग")]: translate("लिंग"),
                    [translate("पत्ता")]: translate("पत्ता"),
                    [translate("अर्जदाराचा प्रकार")]:
                      translate("अर्जदाराचा प्रकार"),
                    [translate("संचालकांचे छायाचित्र")]: translate(
                      "संचालकांचे छायाचित्र"
                    ),
                    [translate("काडा")]: translate("काडा"),
                  }}
                />
              </div>
            ) : (
              <p className="text-center mt-4">
                {translate("No directors added yet.")}
              </p>
            )}

            <hr />
          </Form>
        )}
      </Formik>
    );
  }
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE_URL: ", API_BASE_URL);

const KagadpatraJodaneTab = React.forwardRef(({ applicationId }, ref) => {
  const { translate } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentFiles, setDocumentFiles] = useState({});

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      setDocuments([]); // Clear previous documents

      if (!applicationId) {
        console.warn(
          "KagadpatraJodaneTab: No applicationId provided. Skipping fetch."
        );
        setLoading(false);
        return;
      }

      const apiUrl = `${API_BASE_URL}/FrmAppliVerificationMst`;

      console.log(`KagadpatraJodaneTab: Attempting to POST to: ${apiUrl}`);
      console.log(
        `KagadpatraJodaneTab: Sending payload: {"applicationId": "${applicationId}"}`
      );

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ applicationId: applicationId }),
        });

        console.log(
          `KagadpatraJodaneTab: Received response status: ${response.status}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `HTTP error! status: ${response.status}. Response: ${errorText}`
          );
        }

        const data = await response.json();
        console.log("KagadpatraJodaneTab: Fetched data:", data);

        if (data && Array.isArray(data.data)) {
          const relevantDocuments = data.data.filter(
            (doc) => String(doc.APPLIID) === String(applicationId)
          );
          const initializedDocuments = relevantDocuments.map((doc) => ({
            ...doc,
            remarks: doc.REMARKS || "", // Use existing remarks if available, else initialize empty
            checked: false, // Initialize checkbox state (if you're using it)
          }));
          setDocuments(initializedDocuments);
          console.log(
            "KagadpatraJodaneTab: Processed and initialized documents:",
            initializedDocuments
          );
        } else {
          console.warn(
            "KagadpatraJodaneTab: API response 'data' property is missing or not an array.",
            data
          );
          setDocuments([]);
        }
      } catch (e) {
        console.error("KagadpatraJodaneTab: Error fetching documents:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [applicationId]); // Re-fetch when applicationId changes

  const handleInputChange = (documentId, fieldName, value) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.PRIMARYDOCID === documentId ? { ...doc, [fieldName]: value } : doc
      )
    );
  };

  const handleCheckboxChange = (documentId, fieldName, isChecked) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.PRIMARYDOCID === documentId
          ? { ...doc, [fieldName]: isChecked }
          : doc
      )
    );
  };

  const handleDownload = async (row) => {
    try {
      if (!row.fileUrl) {
        console.warn("KagadpatraJodaneTab: No file URL found for download:", row);
        alert("फाईल उपलब्ध नाही.");
        return;
      }

      // Handle relative URLs (e.g. "/uploads/file.pdf")
      const fullUrl = row.fileUrl.startsWith("http")
        ? row.fileUrl
        : `${API_BASE_URL}${row.fileUrl}`;

      // Derive file name properly
      const fileName = `${row.DOCTYPENAME || "document"}${
        row.FILETYPE ? row.FILETYPE : ".pdf"
      }`;

      console.log(`KagadpatraJodaneTab: Downloading file from: ${fullUrl}`);

      // Fetch file as blob
      const response = await fetch(fullUrl, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create temp link
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log(`File downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error("KagadpatraJodaneTab: Error downloading file:", error);
      alert("फाईल डाउनलोड करताना त्रुटी आली.");
    }
  };

  const handleFileUpload = (documentId, file) => {
    setDocumentFiles(prev => ({
      ...prev,
      [documentId]: file
    }));
  };



  const tableHeaders = [
    translate("दस्ताऐवजाचे नाव"),
    translate("शेरा"),
    translate("View"),
    translate("Download"),
  ];

  const tableData = documents.map((doc) => ({
    [translate("दस्ताऐवजाचे नाव")]: translate(doc.DOCTYPENAME),
    View: doc.fileUrl ? (
      <a
        href={
          doc.fileUrl.startsWith("/")
            ? `${API_BASE_URL}${doc.fileUrl}`
            : doc.fileUrl
        }
        target="_blank"
        rel="noopener noreferrer"
        className="document-link"
      >
        View ({doc.FILETYPE ? doc.FILETYPE.substring(1) : "File"})
      </a>
    ) : (
      <span>{translate("N/A")}</span>
    ),
    Download: doc.fileUrl ? (
      <a
        onClick={(e) => {
          e.preventDefault();
          handleDownload(doc);
        }}
        className="document-link"
        style={{ cursor: "pointer" }}
      >
        Download ({doc.FILETYPE ? doc.FILETYPE.substring(1) : "File"})
      </a>
    ) : (
      <span>{translate("N/A")}</span>
    ),
    checked: doc.checked,
    remarks: doc.remarks,
    // Include PRIMARYDOCID for internal mapping if needed by the parent
    PRIMARYDOCID: doc.PRIMARYDOCID,
  }));

  const keyMapping = {
    [translate("दस्ताऐवजाचे नाव")]: translate("दस्ताऐवजाचे नाव"),
    [translate("शेरा")]: "remarks",
    [translate("View")]: "View",
    [translate("Download")]: "Download",
  };

  // Expose methods to the parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    getDocumentDetails: () => documents, // Expose the full documents array
    // You might also want to expose a method for validation if there are validation rules for documents
    // isValid: () => { /* Add validation logic here based on documents state */ return true; }
    getDocumentFiles: () => documentFiles,
  }));

  if (loading) {
    return (
      <p className="text-center mt-4">
        {translate("कागदपत्रे लोड होत आहेत...")}
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-4 text-danger">
        {translate("कागदपत्रे लोड करताना त्रुटी आली:")} {error}
      </p>
    );
  }

  return (
    <div className="kagadpatra-jodane-tab">
      <Table
        headers={tableHeaders}
        data={tableData}
        keyMapping={keyMapping}
        onInputChange={handleInputChange}
        onCheckboxChange={handleCheckboxChange}
        checkboxIdentifier="PRIMARYDOCID"
        showCheckboxInHeader={false}
        noDataMessage={translate("या अर्जासाठी कोणतीही कागदपत्रे आढळली नाहीत.")}
      />
    </div>
  );
});

function FrmApplicationEntryAuthMst() {

  const location = useLocation();
  const mode = location.state?.mode
  console.log("Mode : ", mode);
  const { translate } = useLanguage();
  const [key, setKey] = useState("prathmikMahiti");
  const ipAddress = useIP();
  const { user } = useAuth(); // Assuming useAuth provides user object
  const userId = user?.userId;
  const UlbId = user?.ulbId;
  const navigate = useNavigate();
  const { setLoading } = useLoader();
  // Retrieve applicationNo from localStorage
  const storedApplicationNo = localStorage.getItem("selectedApplicationNo");
  console.log(
    "FrmApplicationEntryAuthMst - Application No from localStorage:",
    storedApplicationNo
  );
  console.log(
    "FrmApplicationEntryAuthMst - Component Mounted/Rendered. UlbId:",
    UlbId
  );
  const params = new URLSearchParams(location.search);
  const applicationId = params.get("applicationId");
  console.log(
    "FrmApplicationEntryAuthMst - Application ID from URL:",
    applicationId
  );
  const validationSchema = ValidationSchemas(translate).FrmAppliVerificationMst;

  // Refs for child components
  const prathmikMahitiTabRef = useRef(null);
  const sanchalakMahitiTabRef = useRef(null);
  const kagadpatraJodaneTabRef = useRef(null);

  const approvalFormikRef = useRef(null);

  const [fileAppliBytes, setFileAppliBytes] = useState(null); 
  const [appliDocPdf, setAppliDocPdf] = useState(null);     
  const [visitDocuments, setVisitDocuments] = useState([]); 


  const handleMainApplicationSubmit = async () => {
    debugger;
    setLoading(true);

    try {
      // --- 1. Collect PrathmikMahitiTab data ---
      let prathmikMahitiValues = {};
      let tradeRateList = [];
      let selectedTradeIds = [];

      if (!prathmikMahitiTabRef.current) {
        alert(translate("प्राथमिक माहिती टॅब लोड झालेला नाही."));
        setKey("prathmikMahiti");
        return;
      }

      await prathmikMahitiTabRef.current.submit();
      prathmikMahitiValues = prathmikMahitiTabRef.current.getValues();
      tradeRateList = prathmikMahitiTabRef.current.getTradeRateList();
      selectedTradeIds = prathmikMahitiTabRef.current.getSelectedTradeIds();

      console.log("prathmikMahitiValues: ", prathmikMahitiValues);

      const prathmikMahitiIsValid = await prathmikMahitiTabRef.current.isValid();
      if (!prathmikMahitiIsValid) {
        alert(translate("कृपया 'प्राथमिक माहिती' टॅबमधील त्रुटी दूर करा."));
        setKey("prathmikMahiti");
        return;
      }

      // Format trade strings
      const In_Applitradetype_Str_Formatted = tradeRateList
        .map((item) => `${item.tradeTypeId}$${item.rate}`)
        .join("#");
      const In_Applitrade_Str_Formatted = selectedTradeIds.join("#");

      // --- 2. Collect SanchalakMahitiTab data --- (Remains the same)
      let directorsData = [];
      if (sanchalakMahitiTabRef.current) {
        directorsData = sanchalakMahitiTabRef.current.getDirectorList();
        if (directorsData.length === 0) {
          console.warn("Directors list is empty. Check if this is required.");
        }
      } else {
        alert(translate("संचालक माहिती टॅब लोड झालेला नाही."));
        setKey("sanchalakMahiti");
        return;
      }

      const In_Applidirector_Str_Formatted = directorsData
        .map((d) => `${d.DIRECTORID || ""}$${d.DIRCTORNAME || ""}$${d.VOTERID || ""}$${d.ADDRESS || ""}$${d.MOBILENO || ""}$${d.EMAIL || ""}$${d.GENDER || ""}$${d.APPLITYPEID || ""}$${d.ADHARNO || ""}`)
        .join("#");

      // --- 3. Collect KagadpatraJodaneTab data --- (Remains the same)
      let documentDetails = [];
      if (kagadpatraJodaneTabRef.current) {
        documentDetails = kagadpatraJodaneTabRef.current.getDocumentDetails();
      }

      let approvalStatus = "A";
      let rejectionRemark = "";
      if (approvalFormikRef.current) {
        approvalStatus = approvalFormikRef.current.values.approvalStatus;
        rejectionRemark = approvalFormikRef.current.values.rejectionRemark;
        if (approvalStatus === "R" && !rejectionRemark.trim()) {
          alert(translate("कृपया रद्द करण्याचे कारण प्रविष्ट करा."));
          return;
        }
      }

      const formatToYYYYMMDD = (date) => {
        if (!date) return null;
        if (date instanceof Date) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }
        return date;
      };

      let licenseDays = 0;
      const startDate = prathmikMahitiValues.fromDate; 
      const endDate = prathmikMahitiValues.toDate;   
      
      if (startDate instanceof Date && endDate instanceof Date) {
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          licenseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          if (licenseDays === 1 && diffTime === 0) {
              licenseDays = 1;
          } else if (diffTime > 0) {
          } else {
              licenseDays = 0;
          }

      } else {
          console.warn("Date values are not valid Date objects for license days calculation.");
    
          licenseDays = 0; 
      }

      // --- 6. Prepare payload ---
      const safeNumber = (val) => (val ? Number(val) : 0);

      const finalPayload = {
        In_UserId: userId,
        In_Appid: safeNumber(applicationId),
        In_AppliNo: storedApplicationNo,
        In_OldLicencNo: null,
        In_ShopName: prathmikMahitiValues.EngShopName,
        In_PANNo: prathmikMahitiValues.PanCard,
        In_ContactNo: safeNumber(prathmikMahitiValues.ContactNo),
        In_Email: prathmikMahitiValues.Email,
        In_Address: prathmikMahitiValues.ShopAddress,
        In_ZoneId: safeNumber(prathmikMahitiValues.ZoneNo),
        In_WardId: safeNumber(prathmikMahitiValues.WardNo),
        In_IsProd: prathmikMahitiValues.isItemManufactured === "yes" ? "Y" : "N",
        In_OwnSpace: prathmikMahitiValues.isOwnBrandBusinessNo === "OWNER" ? "Y" : "N",
        In_Agrmentwith: prathmikMahitiValues.OwnerName,
        In_Area: safeNumber(prathmikMahitiValues.UsedArea),
        In_IsCorpNOC: prathmikMahitiValues.NoObjectionCertificate === "yes" ? "Y" : "N",
        In_BusStartYr: safeNumber(prathmikMahitiValues.YearOfCommencement),
        In_ShopActNo: prathmikMahitiValues.FormNo,
        In_foodlicno: prathmikMahitiValues.NondaniFormNo || null,
  
        In_LicDays: licenseDays,
        In_Applitrade_Str: In_Applitrade_Str_Formatted,
        In_Applitradetype_Str: In_Applitradetype_Str_Formatted,
        In_Applidirector_Str: In_Applidirector_Str_Formatted,
        In_Source: config.source, // Using config.source as seen in your provided code
        In_ShopNameMar: prathmikMahitiValues.MarShopName,
        In_PlaceOwnerName: prathmikMahitiValues.OwnerName,
        In_PlaceOwnerAddress: prathmikMahitiValues.OwnerAddress,
        In_FromDate: formatToYYYYMMDD(prathmikMahitiValues.fromDate),
        In_ToDate: formatToYYYYMMDD(prathmikMahitiValues.toDate),
        In_Appstatus: approvalStatus,
        In_Appstatusremark: rejectionRemark,
        in_amount: safeNumber(prathmikMahitiValues.amount),
        In_OrgId: safeNumber(UlbId),
        in_arramount: safeNumber(prathmikMahitiValues.ArrearsAmount),
        in_ipaddr: ipAddress,
        in_PropNo: prathmikMahitiValues.PropertyNo || "",
        in_MarketPropNo: prathmikMahitiValues.MarketPropertyNo || "",
      };

      console.log("Final Payload:", finalPayload);
      console.log(`Calculated In_LicDays: ${licenseDays}`);

      // --- 7. Call API ---
      const response = await apiService.post(`aomk_appli_auth_ins`, finalPayload);
      console.log("API Response:", response.data);

      // Assuming success is indicated by Out_Errorcode of 9999 or similar
      const isSuccess = response.data && (response.data.errorCode === 9999 || response.data.Out_Errorcode === 9999);

      if (isSuccess) {
        const successMessage = response.data.message || response.data.Out_Errormsg || "Application submitted successfully.";
        alert(translate(successMessage));

        const submittedApplicationId = applicationId || response.data.appId;

        // Upload director photos (Logic remains the same)
        if (directorsData.length > 0 && submittedApplicationId) {
          for (const director of directorsData) {
            if (director._photoFile) {
              const formData = new FormData();
              formData.append("directorid", director.DIRECTORID);
              formData.append("appid", submittedApplicationId);
              formData.append("imagedata", director._photoFile);

              try {
                const uploadResponse = await apiService.post(`updateDirectorPhoto`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
                if (uploadResponse.data && uploadResponse.data.success) {
                  console.log(`Photo uploaded for ${director.DIRCTORNAME}`);
                } else {
                  console.error(uploadResponse.data?.message || "Director photo upload failed.");
                }
              } catch (err) {
                console.error("Director photo upload error:", err);
              }
            }
          }
        }
        navigate(`/Transaction/FrmApplicationEntryAuthList.aspx`);
      } else {
        const errorMessage = response.data.message || response.data.Out_Errormsg || "An unknown error occurred during submission.";
        alert(translate(errorMessage));
      }
    } catch (error) {
      console.error(error);
      alert(translate(error.response?.data?.message || error.message || "An unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  };

  const handleMode4Submit = async () => {
    setLoading(true);
    debugger;

    try {
      let prathmikMahitiValues = {};
      let tradeRateList = [];
      let selectedTradeIds = [];
      let userPhotoFile = null;
      let userDocumentFile = null;
      let applicationDocuments = [];
      let directorsData = [];
      let documentFiles = {};

      if (!prathmikMahitiTabRef.current) {
        alert(translate("प्राथमिक माहिती टॅब लोड झालेला नाही."));
        setKey("prathmikMahiti");
        return;
      }

      await prathmikMahitiTabRef.current.submit();
      prathmikMahitiValues = prathmikMahitiTabRef.current.getValues();
      tradeRateList = prathmikMahitiTabRef.current.getTradeRateList();
      selectedTradeIds = prathmikMahitiTabRef.current.getSelectedTradeIds();
      userPhotoFile = prathmikMahitiValues.userPhoto;
      userDocumentFile = prathmikMahitiValues.userDocument;

      if (sanchalakMahitiTabRef.current) {
        directorsData = sanchalakMahitiTabRef.current.getDirectorList();
      } else {
        alert(translate("संचालक माहिती टॅब लोड झालेला नाही."));
        setKey("sanchalakMahiti");
        return;
      }

      if (kagadpatraJodaneTabRef.current) {
        applicationDocuments = kagadpatraJodaneTabRef.current.getDocumentDetails();
        documentFiles = kagadpatraJodaneTabRef.current.getDocumentFiles();
      }


      console.log("userPhotoFile before validation:", userPhotoFile);
      console.log("prathmikMahitiValues:", prathmikMahitiValues);
      console.log("userDocumentFile before validation:", userDocumentFile);
      console.log("userPhotoFile type:", userPhotoFile?.constructor?.name);
      console.log("userDocumentFile type:", userDocumentFile?.constructor?.name);


      if (!userPhotoFile) {
        alert(translate("कृपया अर्जदाराचा फोटो अपलोड करा."));
        setKey("prathmikMahiti");
        return;
      }

      if (!userDocumentFile) {
        alert(translate("कृपया दस्तऐवज अपलोड करा."));
        setKey("prathmikMahiti");
        return;
      }

      const prathmikMahitiIsValid = await prathmikMahitiTabRef.current.isValid();
      if (!prathmikMahitiIsValid) {
        alert(translate("कृपया 'प्राथमिक माहिती' टॅबमधील त्रुटी दूर करा."));
        setKey("prathmikMahiti");
        return;
      }

      const In_Applitradetype_Str_Formatted = tradeRateList
        .map((item) => `${item.tradeTypeId}$${item.rate}`)
        .join("#");

      const In_Applitrade_Str_Formatted = selectedTradeIds.join("#");

      const In_Applidirector_Str_Formatted = directorsData
      .map((d) => `${d.DIRECTORID || ""}$${d.DIRCTORNAME || ""}$${d.VOTERID || ""}$${d.ADDRESS || ""}$${d.MOBILENO || ""}$${d.EMAIL || ""}$${d.GENDER || ""}$${d.APPLITYPEID || ""}$${d.ADHARNO || ""}`)
      .join("#");

      const formatToYYYYMMDD = (date) => {
        if (!date) return null;
        if (date instanceof Date) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }
        return date;
      };

      let licenseDays = 0;
      const startDate = prathmikMahitiValues.fromDate;
      const endDate = prathmikMahitiValues.toDate;
      
      if (startDate instanceof Date && endDate instanceof Date) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        licenseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (licenseDays === 1 && diffTime === 0) {
          licenseDays = 1;
        } else if (diffTime > 0) {
        } else {
          licenseDays = 0;
        }
      } else {
        console.warn("Date values are not valid Date objects for license days calculation.");
        licenseDays = 0;
      }

      const safeNumber = (val) => (val ? Number(val) : 0);

      const finalPayload = {
        In_UserId: userId,
        In_Appid: safeNumber(applicationId),
        In_AppliNo: storedApplicationNo,
        In_Mode: 1, 
        In_OldLicencNo: prathmikMahitiValues.licenseNo || "",
        In_ShopName: prathmikMahitiValues.EngShopName,
        In_PANNo: prathmikMahitiValues.PanCard,
        In_ContactNo: safeNumber(prathmikMahitiValues.ContactNo),
        In_Email: prathmikMahitiValues.Email,
        In_Address: prathmikMahitiValues.ShopAddress,
        In_ZoneId: safeNumber(prathmikMahitiValues.ZoneNo),
        In_WardId: safeNumber(prathmikMahitiValues.WardNo),
        In_IsProd: prathmikMahitiValues.isItemManufactured === "yes" ? "Y" : "N",
        In_OwnSpace: prathmikMahitiValues.isOwnBrandBusinessNo === "yes" ? "Y" : "N",
        In_Agrmentwith: prathmikMahitiValues.AggrementType,
        In_Area: safeNumber(prathmikMahitiValues.UsedArea),
        In_IsCorpNOC: prathmikMahitiValues.NoObjectionCertificate === "yes" ? "Y" : "N",
        In_BusStartYr: safeNumber(prathmikMahitiValues.YearOfCommencement),
        In_ShopActNo: prathmikMahitiValues.FormNo,
        In_foodlicno: prathmikMahitiValues.NondaniFormNo || null,
        In_LicDays: licenseDays,
        In_Applitrade_Str: In_Applitradetype_Str_Formatted,
        In_Applitradetype_Str: In_Applitradetype_Str_Formatted,
        In_Applidirector_Str: In_Applidirector_Str_Formatted,
        In_Source: config.source,
        In_ShopNameMar: prathmikMahitiValues.MarShopName,
        In_PlaceOwnerName: prathmikMahitiValues.OwnerName,
        In_PlaceOwnerAddress: prathmikMahitiValues.OwnerAddress,
        In_FromDate: formatToYYYYMMDD(prathmikMahitiValues.fromDate),
        In_ToDate: formatToYYYYMMDD(prathmikMahitiValues.toDate),
        in_amount: safeNumber(prathmikMahitiValues.amount),
        In_OrgId: safeNumber(UlbId),
        In_ArrAmount: safeNumber(prathmikMahitiValues.ArrearsAmount),
        in_ipaddr: ipAddress,
        In_siuser: userId, 
        in_PropNo: prathmikMahitiValues.PropertyNo || "",
        in_MarketPropNo: prathmikMahitiValues.MarketPropertyNo || "",
        In_Appstatus: "A", 
        In_Appstatusremark: "",
      };

      console.log("Mode 4 Payload:", finalPayload);

      const response = await apiService.post(`application-verify`, finalPayload);
      console.log("Mode 4 API Response:", response.data);

      const isSuccess = response.data && response.data.OUT_ERRORCODE === 9999;

      if (isSuccess) {
        const successMessage = response.data.OUT_ERRORMSG || "Site visit details saved successfully.";
        const applicationIdFromResponse = response.data.OUT_APPID || applicationId;
        const applicationNoFromResponse = response.data.OUT_APPLINO || storedApplicationNo;

        if (userPhotoFile || userDocumentFile) {
        const formData = new FormData();
        
        formData.append("applicationId", applicationIdFromResponse);
        formData.append("applicationNo", applicationNoFromResponse);
        formData.append("ulbId", UlbId);
        formData.append("userId", userId);

        if (applicationDocuments.length > 0) {
          const docsToUpload = [];

          applicationDocuments.forEach((doc, index) => {
            const primaryDocId = doc.PRIMARYDOCID || doc.primaryDocId;
            const file = documentFiles[primaryDocId];

            if (file) {
              docsToUpload.push({
                primaryDocId: primaryDocId,
                docId: doc.DOCID || doc.docId || doc.NUM_APPLIDOC_DOCID,
                fileType: doc.FILETYPE || doc.fileType || ".pdf",
                fileField: `document${index}`,
              });

              formData.append(`document${index}`, file);

              console.log(`Document ${index} attached:`, file.name);
            }
          });

          if (docsToUpload.length > 0) {
            formData.append(
              "applicationDocuments",
              JSON.stringify(docsToUpload)
            );
          }

          console.log("Documents To Upload:", docsToUpload);
        }

        if (directorsData.length > 0) {
          const directorDetails = directorsData.map((d, index) => ({
            directorId: d.DIRECTORID || d.directorId || (index + 1),
            imageField: `directorImage${index}`
          }));
          formData.append("directorDetails", JSON.stringify(directorDetails));
          
          // Append director photos
          directorsData.forEach((director, index) => {
            if (director._photoFile || director.imgDirectorImage) {
              const photoFile = director._photoFile || director.imgDirectorImage;
              formData.append(`directorImage${index}`, photoFile);
            }
          });
        }
        
        if (userPhotoFile) {
          formData.append("visitPhoto", userPhotoFile);
          console.log("Photo attached:", userPhotoFile.name, userPhotoFile.size);
        }
        if (userDocumentFile) {
          formData.append("visitDocument", userDocumentFile);
          console.log(" Document attached:", userDocumentFile.name, userDocumentFile.size);
        }
        for (let [key, value] of formData.entries()) {
          console.log("FormData entry:", key, value instanceof File ? value.name : value);
        }

        try {
          const uploadResponse = await fetch(`${API_BASE_URL}/uploadSiteVisitFiles`, {
            method: 'POST',
            body: formData,
          });

          const result = await uploadResponse.json();
          console.log("Upload Result:", result);
          
          if (result.success) {
            console.log("Site visit files uploaded successfully");
          } else {
            console.error("File upload failed:", result?.message);
          }
        } catch (err) {
          console.error("File upload error:", err);
        }
      }
        // if (directorsData.length > 0 && applicationIdFromResponse) {
        //   for (const director of directorsData) {
        //     if (director._photoFile) {
        //       const formData = new FormData();
        //       formData.append("directorid", director.DIRECTORID);
        //       formData.append("appid", applicationIdFromResponse);
        //       formData.append("imagedata", director._photoFile);

        //       try {
        //         const uploadResponse = await apiService.post(`updateDirectorPhoto`, formData, {
        //           headers: { "Content-Type": "multipart/form-data" },
        //         });
        //         if (uploadResponse.data && uploadResponse.data.success) {
        //           console.log(`Photo uploaded for ${director.DIRCTORNAME}`);
        //         }
        //       } catch (err) {
        //         console.error("Director photo upload error:", err);
        //       }
        //     }
        //   }
        // }

        alert(translate(successMessage));
        navigate(`/Transaction/FrmApplicationEntryAuthList.aspx`);
      } else {
        const errorMessage = response.data.OUT_ERRORMSG || "An unknown error occurred during site visit submission.";
        alert(translate(errorMessage));
      }
    } catch (error) {
      console.error("Mode 4 Submit Error:", error);
      alert(translate(error.response?.data?.message || error.message || "An unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  };

  const handleMode5Submit = async () => {
    setLoading(true);
    debugger;

    try {
      let prathmikMahitiValues = {};
      let tradeRateList = [];
      let selectedTradeIds = [];
      let applicationDocuments = [];
      let directorsData = [];
      let documentFiles = {};

      if (!prathmikMahitiTabRef.current) {
        alert(translate("प्राथमिक माहिती टॅब लोड झालेला नाही."));
        setKey("prathmikMahiti");
        return;
      }

      await prathmikMahitiTabRef.current.submit();
      prathmikMahitiValues = prathmikMahitiTabRef.current.getValues();
      tradeRateList = prathmikMahitiTabRef.current.getTradeRateList();
      selectedTradeIds = prathmikMahitiTabRef.current.getSelectedTradeIds();

      if (sanchalakMahitiTabRef.current) {
        directorsData = sanchalakMahitiTabRef.current.getDirectorList();
      } else {
        alert(translate("संचालक माहिती टॅब लोड झालेला नाही."));
        setKey("sanchalakMahiti");
        return;
      }

      if (kagadpatraJodaneTabRef.current) {
        applicationDocuments = kagadpatraJodaneTabRef.current.getDocumentDetails();
        documentFiles = kagadpatraJodaneTabRef.current.getDocumentFiles();
      }

      console.log("prathmikMahitiValues:", prathmikMahitiValues);
      console.log("Directors Data:", directorsData);
      console.log("Application Documents:", applicationDocuments);

      const prathmikMahitiIsValid = await prathmikMahitiTabRef.current.isValid();
      if (!prathmikMahitiIsValid) {
        alert(translate("कृपया 'प्राथमिक माहिती' टॅबमधील त्रुटी दूर करा."));
        setKey("prathmikMahiti");
        return;
      }

      const In_Applitradetype_Str_Formatted = tradeRateList
        .map((item) => `${item.tradeTypeId}$${item.rate}`)
        .join("#");
      const In_Applitrade_Str_Formatted = selectedTradeIds.join("#");

      const In_Applidirector_Str_Formatted = directorsData
        .map((d) => `${d.DIRECTORID || ""}$${d.DIRCTORNAME || ""}$${d.VOTERID || ""}$${d.ADDRESS || ""}$${d.MOBILENO || ""}$${d.EMAIL || ""}$${d.GENDER || ""}$${d.APPLITYPEID || ""}$${d.ADHARNO || ""}`)
        .join("#");

      const formatToYYYYMMDD = (date) => {
        if (!date) return null;
        if (date instanceof Date) {
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }
        return date;
      };

      let licenseDays = 0;
      const startDate = prathmikMahitiValues.fromDate;
      const endDate = prathmikMahitiValues.toDate;
      
      if (startDate instanceof Date && endDate instanceof Date) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        licenseDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        if (licenseDays === 1 && diffTime === 0) {
          licenseDays = 1;
        } else if (diffTime > 0) {
        } else {
          licenseDays = 0;
        }
      } else {
        console.warn("Date values are not valid Date objects for license days calculation.");
        licenseDays = 0;
      }

      const safeNumber = (val) => (val ? Number(val) : 0);

      let approvalStatus = "A";
      let rejectionRemark = "";
      if (approvalFormikRef.current) {
        approvalStatus = approvalFormikRef.current.values.approvalStatus;
        rejectionRemark = approvalFormikRef.current.values.rejectionRemark;
        
        if (approvalStatus === "R" && !rejectionRemark.trim()) {
          alert(translate("कृपया रद्द करण्याचे कारण प्रविष्ट करा."));
          return;
        }
      }

      let appStatus = "";
      let appStatusRemark = "";
      
      if (approvalStatus === "A") {
        appStatus = "VA"; 
        appStatusRemark = "";
      } else if (approvalStatus === "R") {
        appStatus = "R"; 
        appStatusRemark = rejectionRemark;
      }

      const finalPayload = {
        In_UserId: userId,
        In_Appid: safeNumber(applicationId),
        In_AppliNo: storedApplicationNo,
        In_Mode: 2, 
        In_OldLicencNo: prathmikMahitiValues.licenseNo || "",
        In_ShopName: prathmikMahitiValues.EngShopName,
        In_PANNo: prathmikMahitiValues.PanCard,
        In_ContactNo: safeNumber(prathmikMahitiValues.ContactNo),
        In_Email: prathmikMahitiValues.Email,
        In_Address: prathmikMahitiValues.ShopAddress,
        In_ZoneId: safeNumber(prathmikMahitiValues.ZoneNo),
        In_WardId: safeNumber(prathmikMahitiValues.WardNo),
        In_IsProd: prathmikMahitiValues.isItemManufactured === "yes" ? "Y" : "N",
        In_OwnSpace: prathmikMahitiValues.isOwnBrandBusinessNo === "yes" ? "Y" : "N",
        In_Agrmentwith: prathmikMahitiValues.AggrementType,
        In_Area: safeNumber(prathmikMahitiValues.UsedArea),
        In_IsCorpNOC: prathmikMahitiValues.NoObjectionCertificate === "yes" ? "Y" : "N",
        In_BusStartYr: safeNumber(prathmikMahitiValues.YearOfCommencement),
        In_ShopActNo: prathmikMahitiValues.FormNo,
        In_foodlicno: prathmikMahitiValues.NondaniFormNo || null,
        In_LicDays: licenseDays,
        In_Applitrade_Str: In_Applitradetype_Str_Formatted,
        In_Applitradetype_Str: In_Applitradetype_Str_Formatted,
        In_Applidirector_Str: In_Applidirector_Str_Formatted,
        In_Source: config.source,
        In_ShopNameMar: prathmikMahitiValues.MarShopName,
        In_PlaceOwnerName: prathmikMahitiValues.OwnerName,
        In_PlaceOwnerAddress: prathmikMahitiValues.OwnerAddress,
        In_FromDate: formatToYYYYMMDD(prathmikMahitiValues.fromDate),
        In_ToDate: formatToYYYYMMDD(prathmikMahitiValues.toDate),
        in_amount: safeNumber(prathmikMahitiValues.amount),
        In_OrgId: safeNumber(UlbId),
        In_ArrAmount: safeNumber(prathmikMahitiValues.ArrearsAmount),
        in_ipaddr: ipAddress,
        In_siuser: userId, 
        in_PropNo: prathmikMahitiValues.PropertyNo || "",
        in_MarketPropNo: prathmikMahitiValues.MarketPropertyNo || "",
        In_Appstatus: appStatus, 
        In_Appstatusremark: appStatusRemark, 
      };

      console.log("Mode 5 Payload:", finalPayload);

      const response = await apiService.post(`application-verify`, finalPayload);
      console.log("Mode 5 API Response:", response.data);

      const isSuccess = response.data && response.data.OUT_ERRORCODE === 9999;

      if (isSuccess) {
        const successMessage = response.data.OUT_ERRORMSG || "Application verified successfully.";
        const applicationIdFromResponse = response.data.OUT_APPID || applicationId;

        if (directorsData.length > 0 && applicationIdFromResponse) {
          for (const director of directorsData) {
            if (director._photoFile) {
              const formData = new FormData();
              formData.append("directorid", String(director.DIRECTORID));
              formData.append("appid", String(applicationIdFromResponse));
              formData.append("imagedata", director._photoFile);

              try {
                const uploadResponse = await apiService.post(`updateDirectorPhoto`, formData, {
                  headers: { "Content-Type": "multipart/form-data" },
                });
                if (uploadResponse.data && uploadResponse.data.success) {
                  console.log(`Photo uploaded for ${director.DIRCTORNAME}`);
                } else {
                  console.error(`Director photo upload failed for ${director.DIRCTORNAME}:`, uploadResponse.data?.message);
                }
              } catch (err) {
                console.error(`Director photo upload error for ${director.DIRCTORNAME}:`, err);
              }
            }
          }
        }

        alert(translate(successMessage));
        navigate(`/Transaction/FrmApplicationEntryAuthList.aspx`);
      } else {
        const errorMessage = response.data.OUT_ERRORMSG || "An unknown error occurred during verification.";
        alert(translate(errorMessage));
      }
    } catch (error) {
      console.error("Mode 5 Submit Error:", error);
      alert(translate(error.response?.data?.message || error.message || "An unexpected error occurred."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <Container className="mt-4">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्ज अधिकृतता मास्टर")}
        />
        <hr />
        <Tab.Container
          id="license-entry-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
        >
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="prathmikMahiti">
                {translate("प्राथमिक माहिती")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="sanchalakMahiti">
                {translate("संचालक माहिती")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="kagadpatraJodane">
                {translate("कागदपत्र जोडणे")}
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="mt-3">
            {/* IMPORTANT: Set unmountOnExit to false for all tabs you need to access via ref */}
            <Tab.Pane eventKey="prathmikMahiti" unmountOnExit={false}>
              <PrathmikMahitiTab
                UlbId={UlbId}
                mode={mode}
                applicationId={applicationId}
                ref={prathmikMahitiTabRef}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="sanchalakMahiti" unmountOnExit={false}>
              <SanchalakMahitiTab
                UlbId={UlbId}
                applicationId={applicationId}
                ref={sanchalakMahitiTabRef}
                // onSubmit={handleSanchalakMahitiSubmit} // If you prefer prop-based state management, keep this
              />
            </Tab.Pane>
            <Tab.Pane eventKey="kagadpatraJodane" unmountOnExit={false}>
              <KagadpatraJodaneTab
                applicationId={applicationId}
                ref={kagadpatraJodaneTabRef}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        {/* This Formik is for the approval status/remark, not directly tied to tab data */}
        <Formik
          initialValues={{
            approvalStatus: "A", // Default to Approve
            rejectionRemark: "",
          }}
          validationSchema={validationSchema}
          innerRef={approvalFormikRef}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="row mb-3 mt-5 align-items-center ">
                {mode != "1" && (
                  <div className="col-auto d-flex gap-3">
                    <Field
                      name="approvalStatus"
                      component={RadioButton}
                      label={translate("मंजूर")} // Approve
                      value="A"
                      id="approveRadio"
                      onChange={() => {
                        setFieldValue("approvalStatus", "A");
                      }}
                    />
                    <Field
                      name="approvalStatus"
                      component={RadioButton}
                      label={translate("रद्द")} // Reject
                      value="R"
                      id="rejectRadio"
                      onChange={() => {
                        setFieldValue("approvalStatus", "R");
                      }}
                    />
                  </div>
                ) }

                {values.approvalStatus === "R" && (
                  <div className="col-md-7 d-flex align-items-center ">
                    <div className="col-md-3">
                      <Label text={`${translate("Rejection Remark")} :`} />
                    </div>
                    <Field
                      name="rejectionRemark"
                      component={InputField}
                      className="form-control"
                    />
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
        <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
          <SaveButton
            type="button"
            text={translate("जतन करा ")}
            onClick={() => {
              if (mode == "1") {
                handleMode4Submit();
              } else if (mode == "2") {
                 handleMode5Submit();
              } else {
                handleMainApplicationSubmit(); 
              } 
            }}
          />
        </div>
      </Container>
    </div>
  );
}
export default FrmApplicationEntryAuthMst;
