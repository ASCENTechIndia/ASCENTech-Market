import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react"; // Added useEffect for potential API calls
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
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
import useIP from "../../../Hooks/UseIp";
import { useAuth } from "../../../Context/AuthContext";
import { ValidationSchemas } from "../../../HOC/Validation/Validation";
import apiService from "../../../../apiService";
import { useLoader } from "../../../Context/LoaderContext";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PrathmikMahitiTab = React.forwardRef(
  ({ UlbId, applicationId, onSubmit }, ref) => {
    const { translate } = useLanguage();
    const { setLoading } = useLoader();
    const getFinancialYearDates = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // 0-indexed

      const startYear = month < 4 ? year - 1 : year;
      const endYear = startYear + 1;

      const from = new Date(`${startYear}-04-01`);
      const to = new Date(`${endYear}-03-31`);

      return { from, to };
    };

    const { from, to } = getFinancialYearDates();
    const [fromDate, setFromDate] = useState(from);
    const [toDate, setToDate] = useState(to);
    const [wardOptions, setWardOptions] = useState([]);
    const [zoneOptions, setZoneOptions] = useState([]);
    const [selectedWardValue, setSelectedWardValue] = useState(null);
    const [licenseTypes, setLicenseTypes] = useState([]); // Unified loading state for zones and wards
    const [selectedZoneValue, setSelectedZoneValue] = useState(""); // Initialize with empty string for dropdown value
    const [tradeCategories, setTradeCategories] = useState([]);
    const [loadingTrades, setLoadingTrades] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);
    const [tradeTypes, setTradeTypes] = useState([]);
    const [tradeMappings, setTradeMappings] = useState([]); // [{counter, tradeId}]
    const [selectedTradeTypeId, setSelectedTradeTypeId] = useState("");
    const [selectedTradeCategoryId, setSelectedTradeCategoryId] =
      useState(null);
    // This state seems unused based on the current logic for adding trades via category/type
    const [tradeRateList, setTradeRateList] = useState([]);
    const [tradeList, setTradeList] = useState([]);
    const [selectedTradeIds, setSelectedTradeIds] = useState([]); // Stores the trade IDs from the application details
    const validationSchema =
      ValidationSchemas(translate).FrmAppliVerificationMst;

    // Formik initial values state
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
      fromDate: fromDate,
      toDate: toDate,
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

    useEffect(() => {
      const fetchLicenseTypes = async () => {
        try {
          const response = await apiService.get(`getLicenseTypes`);
          if (response.data && Array.isArray(response.data.data)) {
            const mapped = response.data.data.map((type) => ({
              label: type.LICENSETYPENAME,
              value: type.LICENSETYPEID.toString(),
            }));
            setLicenseTypes(mapped);
          } else {
            console.warn("No license type data received.");
          }
        } catch (error) {
          console.error("Error fetching license types:", error);
        }
      };

      fetchLicenseTypes(); // ✅ Run on page load
    }, []);

    useEffect(() => {
  const fetchInitialData = async () => {
    try {
      if (!UlbId) return; // wait until UlbId is available

      const [tradeTypesRes, tradeDetailsRes] = await Promise.all([
        apiService.post(`getTradeTypes`, { ulbId: UlbId }),
        applicationId
          ? apiService.post(`getApplicationTradeDetailsByAppId`, { applicationId })
          : Promise.resolve({ data: { data: [] } }),
      ]);

      const tradeListData = tradeTypesRes.data?.data || [];
      setTradeList(tradeListData);

      const existingTradeIds =
        tradeDetailsRes.data?.data?.map((item) =>
          String(item.NUM_APPLITRADE_TRADEID)
        ) || [];

      setSelectedTradeIds(existingTradeIds);
    } catch (error) {
      console.error("Error loading trade data:", error);
      setTradeList([]);
      setSelectedTradeIds([]);
    }
  };

  // Wait a tick to ensure UlbId/applicationId are updated
  const timeout = setTimeout(() => {
    fetchInitialData();
  }, 300);

  return () => clearTimeout(timeout);
}, [UlbId, applicationId]);


    const handleTradeCheckboxChange = (tradeId) => {
      debugger;
      setSelectedTradeIds((prevSelected) => {
        if (prevSelected.includes(tradeId)) {
          return prevSelected.filter((id) => id !== tradeId);
        } else {
          // Return unique IDs only
          return [...new Set([...prevSelected, tradeId])];
        }
      });
    };

    const formikRef = React.useRef();

    // Effect to fetch Zone data
    useEffect(() => {
      const fetchWardData = async () => {
        if (!UlbId) return; // Exit if UlbId is not available

        setLoadingWards(true); // Set loading for wards
        try {
          const wardResponse = await apiService.post(`getWardName`, {
            ulbId: UlbId,
          });

          if (wardResponse.data && wardResponse.data.data) {
            const wardData = wardResponse.data.data.map((w) => ({
              label: w.WARDNAME,
              value: String(w.WARDID),
            }));
            setWardOptions(wardData);
            // This is a key line: if only one ward, it's automatically selected
            if (wardData.length === 1) setSelectedWardValue(wardData[0].value);
          } else {
            alert("No ward data found.");
            setWardOptions([]);
          }
        } catch (err) {
          console.error("Error fetching ward data:", err);
          alert("Failed to load ward data.");
        } finally {
          setLoadingWards(false); // Unset loading for wards
        }
      };

      fetchWardData();
    }, [UlbId]); // Dependency: UlbId for ward data
    useEffect(() => {
      // Only proceed if selectedWardValue is a non-empty string/number and UlbId is valid
      if (!selectedWardValue || UlbId === null || UlbId === undefined) {
        console.log(
          "[Zone Effect] Skipping zone data fetch: selectedWardValue or UlbId is not valid."
        );
        setZoneOptions([]); // Clear zone options if preconditions are not met
        return;
      }

      const fetchZoneData = async () => {
        console.log(
          "[Zone API] Attempting to fetch zones for wardId:",
          selectedWardValue,
          "and ulbId:",
          UlbId
        );
        try {
          const response = await fetch(`${API_BASE_URL}/getDistinctZones`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              wardId: selectedWardValue, // Use the stored value directly
              ulbId: UlbId,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorText}`
            );
          }

          const result = await response.json();
          console.log("[Zone API] Raw response data:", result.data);

          const mappedZones = (result.data || [])
            .filter((zone) => zone.ZONEID !== null && zone.ZONEID !== undefined) // Filter out entries with null/undefined ZONEID
            .map((zone) => ({
              label: zone.ZONENAME,
              value: String(zone.ZONEID), // Ensure value is a string for HTML select
            }));
          setZoneOptions(mappedZones);
          console.log("[Zone API] Mapped zone options:", mappedZones);
        } catch (error) {
          console.error("[Zone API] Error fetching zones:", error);
          setZoneOptions([]); // Clear options on error
        }
      };

      fetchZoneData();
    }, [selectedWardValue, UlbId]); // Dependencies: re-run if selectedWardValue or UlbId changes
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

            // Extract TRADEIDs to pre-populate selectedTradeIds
            const fetchedSelectedTradeIds = fetchedTradeRateList.map(
              (item) => String(item.TRADETYPEID) // Ensure string format
            );
            setSelectedTradeIds(fetchedSelectedTradeIds); // Set the selected trade IDs
          })
          .catch((error) => {
            console.error("Error fetching trade type details:", error);
          });
      }
    }, [applicationId, UlbId]);

    useEffect(() => {
      const fetchApplicationDetails = async () => {
        if (!applicationId || !UlbId) return;

        console.log(
          "Fetching application data for applicationId:",
          applicationId,
          "and ulbId:",
          UlbId
        );

        try {
           setLoading(true);
          const response = await apiService.post(`get-application-details`, {
            AppliList_AppId: applicationId,
            OrgId: UlbId,
          });

          const data = response.data;
          if (data) {
            const fetchedFromDate = data.DAT_APPLI_FROMDT
              ? new Date(data.DAT_APPLI_FROMDT)
              : null;
            const fetchedToDate = data.DAT_APPLI_TODT
              ? new Date(data.DAT_APPLI_TODT)
              : null;
            setApplicationData({
              licenseNo: "",
              EngShopName: data.VAR_APPLI_SHOPNAME || "",
              MarShopName: data.VAR_APPLI_SHOPNAMEMAR || "",
              PanCard: data.VAR_APPLI_PANNO || "",
              ContactNo: data.NUM_APPLI_CONTACTNO || "",
              Email: data.VAR_APPLI_EMAIL || "",
              ShopAddress: data.VAR_APPLI_ADDRESS || "",
              WardNo: data.NUM_APPLI_WARDID || "",
              ZoneNo: data.NUM_APPLI_ZONEID || "",
              ArrearsAmount: "",
              fromDate: fetchedFromDate,
              toDate: fetchedToDate,
              amount: data.AMOUNT || 0,
              isItemManufactured: data.VAR_APPLI_ISPROD === "Y" ? "yes" : "no",
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
            });

            // Set ward and zone values
            if (data.NUM_APPLI_WARDID) {
              setSelectedWardValue(String(data.NUM_APPLI_WARDID));
              console.log(
                "Setting selectedWardValue:",
                String(data.NUM_APPLI_WARDID)
              );
            } else {
              setSelectedWardValue("");
              console.log(
                "No NUM_APPLI_WARDID found, clearing selectedWardValue."
              );
            }

            if (data.NUM_APPLI_ZONEID) {
              setSelectedZoneValue(String(data.NUM_APPLI_ZONEID));
              console.log(
                "Setting selectedZoneValue:",
                String(data.NUM_APPLI_ZONEID)
              );
            } else {
              setSelectedZoneValue("");
              console.log(
                "No NUM_APPLI_ZONEID found, clearing selectedZoneValue."
              );
            }
          } else {
            console.log("No application data found in response.");
            setApplicationData({});
            setSelectedWardValue("");
            setSelectedZoneValue("");
          }
        } catch (error) {
          console.error("Error fetching application details:", error);
          alert("Failed to load application details.");
          setApplicationData({});
          setSelectedWardValue("");
          setSelectedZoneValue("");
        }finally {
      setLoading(false); // 🔹 stop loader (always runs)
    }
      };

      fetchApplicationDetails();
    }, [applicationId, UlbId]);

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
    }));

    const In_Applitradetype_Str = tradeRateList
      .map((item) => `${item.tradeTypeId}$${item.rate}`)
      .join("#"); // THIS IS THE LINE YOU ALREADY HAVE AND IS CORRECT
    const In_Applitrade_Str = selectedTradeIds.join("#");

    return (
      <Formik
        enableReinitialize={true}
        initialValues={applicationData}
        innerRef={formikRef} // Attach the innerRef to Formik
        ValidationSchemas={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          // This is Formik's onSubmit. When triggered, it will log values.
          console.log("Formik values:", values);
          console.log("Trade Rate List (from state):", tradeRateList);
          console.log("Selected Trade IDs (from state):", selectedTradeIds);

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
                <Label
                  text={`${translate("दुकानाचे नाव इंग्रजी")} :`}
                  required
                />
                <Field
                  name="EngShopName"
                  component={InputField}
                  className="form-control"
                  type="text"
                  restrictInput="name"
                />
                <ErrorMessage
                  name="EngShopName"
                  component="div"
                  className="text-danger"
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("दुकानाचे नाव मराठी")} :`} required />
                <Field
                  name="MarShopName"
                  component={InputField}
                  className="form-control"
                  type="text"
                  restrictInput="name"
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
                  restrictInput="pan"
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
                  restrictInput="phone"
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
                  restrictInput="email"
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
                <Label text={`${translate("वार्ड क्र.")} :`} required />
                <Field
                  name="WardNo"
                  component={InputField}
                  className="form-control"
                  type="dropdown"
                  options={wardOptions}
                  onChange={(e) => {
                    setSelectedWardValue(e.target.value); // Update local state for Zone fetching
                    setFieldValue("WardNo", e.target.value); // Update Formik's state
                    setFieldValue("ZoneNo", ""); // Clear Zone when Ward changes
                    setZoneOptions([]); // Clear zone options immediately
                  }}
                />
                <ErrorMessage
                  name="WardNo"
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
                />
                <ErrorMessage
                  name="ZoneNo"
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
                  restrictInput="integer"
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
                        "   स्वते चे: मालकीचे जागेत व्यवसाय करीत आहे का"
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
                  restrictInput="integer"
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
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-3 mt-4">
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
            </div>

            <div className="row mb-3 align-items-center">
              <div className="col-md-4">
                <Label text={`${translate("License Type")} :`} required />
                <Field
                  name="LicenseType"
                  component={InputField}
                  className="form-control"
                  type="dropdown"
                  options={licenseTypes}
                />
                <ErrorMessage
                  name="LicenseType"
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
                  restrictInput="integer"
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
    const formikRef = useRef();

    useImperativeHandle(ref, () => ({
      submit: () => {
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

    useEffect(() => {
      const fetchApplicationTypes = async () => {
        try {
          const response = await apiService.post(`getApplicationTypes`, {
            ulbId: UlbId,
          });
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
            setDirectorList(response.data.data);
            console.log(
              "SanchalakMahitiTab - Successfully fetched existing director data:",
              response.data.data
            );
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

    useEffect(() => {
      console.log(
        "SanchalakMahitiTab - directorList state updated to:",
        directorList
      );
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

    const handleAddDirector = async (values, { resetForm, setFieldValue }) => {
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

      // Generate sequential ID (1, 2, 3, ...)
      const newDirectorId = directorList.length + 1;

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
        directorImage: values.directorPhoto
          ? URL.createObjectURL(values.directorPhoto)
          : null,
        _photoFile: values.directorPhoto,
      };

      setDirectorList((prevList) => {
        const newList = [...prevList, newDirector];
        console.log("Director added to local list. New list:", newList);
        return newList;
      });

      resetForm({
        values: {
          AAdharNo: "",
          SanchalakName: "",
          LicenseNo: "",
          ContactNo: "",
          Email: "",
          Gender: "F",
          Address: "",
          ApplicantType: "",
          directorPhoto: null,
        },
      });
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
    };

    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        innerRef={formikRef}
        validationSchema={validationSchema}
        onSubmit={(_, { setSubmitting }) => {
          if (onSubmit) {
            onSubmit(directorList);
          }
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue }) => (
          <Form>
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
                  name="AAdharNo"
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
                      onChange={() => setFieldValue("Gender", "F")}
                    />
                    <Field
                      name="Gender"
                      component={RadioButton}
                      label={translate("पुरुष")}
                      value="M"
                      id="genderMale"
                      checked={values.Gender === "M"}
                      onChange={() => setFieldValue("Gender", "M")}
                    />
                    <Field
                      name="Gender"
                      component={RadioButton}
                      label={translate("ईतर")}
                      value="O"
                      id="genderOther"
                      checked={values.Gender === "O"}
                      onChange={() => setFieldValue("Gender", "O")}
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
              </div>
              <div className="col-md-4">
                <Label text={`${translate("संचालकाचां फोटो")} :`} required />
                <FileUpload
                  name="directorPhoto"
                  setFieldValue={setFieldValue}
                />
              </div>
            </div>
            <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
              <SaveButton
                type="button"
                text={translate("Add Director")}
                onClick={() =>
                  handleAddDirector(values, {
                    resetForm: formikRef.current.resetForm,
                    setFieldValue,
                  })
                }
              />
            </div>
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
                    translate("काडा"),
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
                              ? director.directorImage // Keep 'blob:' for local preview
                              : director.directorImage
                              ? `${API_BASE_URL}${director.directorImage}` // Prepend base URL for server paths
                              : "" // Empty string if no image URL is present
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

const downloadFileFromUrl = async (fileData, apiBaseUrl, translateFunction) => {
  try {
    // Ensure we use the correct URL for downloading.
    // _backendFileUrl already contains the full URL with API_BASE_URL prefixed.
    const fileUrl = fileData._backendFileUrl;

    if (!fileUrl) {
      throw new Error("File URL is missing for download.");
    }

    const extension = fileData.fileType?.split("/")?.[1] || "file";
    // Sanitize documentName for fileName, replace problematic characters if any
    const safeDocumentName = fileData.documentName
      ? fileData.documentName.replace(/[\\/:*?"<>|]/g, "_")
      : "document";
    const fileName = `${safeDocumentName}.${extension}`;

    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to download file. Server responded with status: ${response.status}`
      );
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName; // This attribute forces download and suggests a filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl); // Clean up the URL object
  } catch (error) {
    alert(translateFunction("फाईल डाउनलोड करण्यात अडचण आली.")); // Use the passed translateFunction
    console.error("Download error:", error);
  }
};

const KagadpatraJodaneTab = forwardRef(({ applicationId, mode }, ref) => {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const ulbId = user?.ulbId;

  const [documentList, setDocumentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formikRef = useRef(null);

  // ✅ Fetch Document Types and Uploaded Documents
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1️⃣ Fetch document types
        const typesResponse = await apiService.post("getDocumentTypesByUlbId", {
          ulbId,
        });
        const apiDocumentTypes =
          typesResponse?.data?.data || typesResponse?.data || [];

        // 2️⃣ Fetch uploaded documents (only if update mode)
        let uploadedDocuments = [];
        if (applicationId && mode === 2) {
          try {
            const uploadedDocsResponse = await apiService.post(
              "getDocumentDetailsWithAppliUlbId",
              { applicationId, ulbId }
            );
            uploadedDocuments =
              uploadedDocsResponse?.data?.data ||
              uploadedDocsResponse?.data ||
              [];
            console.log("Fetched uploaded documents:", uploadedDocuments);
          } catch (uploadError) {
            console.warn("No uploaded documents found:", uploadError);
            uploadedDocuments = [];
          }
        }

        // ✅ Validate the structure
        if (!Array.isArray(apiDocumentTypes)) {
          console.error("Invalid document types response:", typesResponse);
          setError(translate("कागदपत्र प्रकार मिळवण्यात समस्या आली."));
          setDocumentList([]);
          return;
        }

        // 3️⃣ Merge document types and uploaded documents
        const transformedList = apiDocumentTypes.map((docType) => {
          const existingDoc = uploadedDocuments.find(
            (uploaded) => uploaded.DOCID === docType.DOCID
          );

          let preview = null;
          let fileType = null;
          let backendUrl = null;

          if (existingDoc?.fileUrl) {
            preview = existingDoc.fileUrl;
            fileType =
              existingDoc.FILETYPE ||
              (existingDoc.fileUrl.split(".").pop()
                ? `image/${existingDoc.fileUrl.split(".").pop()}`
                : "application/octet-stream");
            backendUrl = preview;
          } else if (existingDoc?.BlobDocFile) {
            const mimeType = existingDoc.FILETYPE || "application/octet-stream";
            preview = `data:${mimeType};base64,${existingDoc.BlobDocFile}`;
            fileType = mimeType;
          }

          return {
            documentId: docType.DOCID,
            documentName: translate(docType.DOCUMENTTYPENAME),
            image: null,
            imageBuffer: existingDoc?.BlobDocFile || null,
            fileType: fileType,
            docDetails: existingDoc?.DocDetails || "",
            _uploadedFilePreview: preview,
            _backendFileUrl: backendUrl,
          };
        });

        // ✅ Update state
        setDocumentList(transformedList);

        // ✅ Initialize Formik values
        const initialValues = transformedList.reduce((acc, doc) => {
          acc[`docDetails_${doc.documentId}`] = doc.docDetails || "";
          return acc;
        }, {});

        if (formikRef.current) {
          formikRef.current.setValues(initialValues);
        }
      } catch (err) {
        console.error("KagadpatraJodaneTab: Error fetching documents:", err);
        setError(
          translate(
            "कागदपत्र प्रकार किंवा अपलोड केलेले कागदपत्र लोड करताना त्रुटी आली."
          )
        );
        setDocumentList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [translate, applicationId, mode, ulbId]);

  // ✅ Expose method to parent
  useImperativeHandle(ref, () => ({
    getDocumentDetails: () => {
      const currentValues = formikRef.current ? formikRef.current.values : {};
      const transformed = documentList.map((doc) => ({
        documentId: doc.documentId,
        documentName: doc.documentName,
        docDetails:
          currentValues[`docDetails_${doc.documentId}`] || doc.docDetails,
        file: doc.image,
        fileType: doc.fileType,
        _uploadedFilePreview: doc._uploadedFilePreview,
      }));
      console.log("Documents ready for submission:", transformed);
      return transformed;
    },
  }));

  // ✅ Handle file upload
  const handleFileUpload = (documentId, file) => {
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    setDocumentList((prev) =>
      prev.map((doc) =>
        doc.documentId === documentId
          ? {
              ...doc,
              image: file,
              _uploadedFilePreview: fileUrl,
              fileType: file.type,
              imageBuffer: null,
              _backendFileUrl: null,
            }
          : doc
      )
    );
  };

  // ✅ Cleanup blob URLs
  useEffect(() => {
    return () => {
      documentList.forEach((doc) => {
        if (doc._uploadedFilePreview?.startsWith("blob:")) {
          URL.revokeObjectURL(doc._uploadedFilePreview);
        }
      });
    };
  }, [documentList]);

  const onSubmit = (values) => {
    console.log("Formik submitted values:", values);
  };

  // ✅ Table headers and key mapping
  const tableHeaders = [
    translate("दस्तऐवजाचे नांव"),
    translate("शेरा"),
    translate("फाईल निवडा"),
  ];
  if (mode === 2) tableHeaders.push(translate("Download"));

  const tableKeyMapping = {
    [translate("दस्तऐवजाचे नांव")]: "documentName",
    [translate("शेरा")]: "docDetailsInput",
    [translate("फाईल निवडा")]: "image_file_upload",
  };
  if (mode === 2) tableKeyMapping[translate("Download")] = "viewdocument";

  return (
    <div className="container mt-4">
      <hr />

      {loading ? (
        <div>{translate("कागदपत्र प्रकार लोड करत आहे...")}</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : documentList.length > 0 ? (
        <Formik
          enableReinitialize
          initialValues={documentList.reduce((acc, doc) => {
            acc[`docDetails_${doc.documentId}`] = doc.docDetails || "";
            return acc;
          }, {})}
          onSubmit={onSubmit}
          innerRef={formikRef}
        >
          {() => (
            <Form>
              <Table
                headers={tableHeaders}
                data={documentList.map((doc) => {
                  const row = {
                    ...doc,
                    docDetailsInput: (
                      <Field
                        name={`docDetails_${doc.documentId}`}
                        className="form-control"
                      />
                    ),
                    image_file_upload: (
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          handleFileUpload(doc.documentId, e.target.files[0])
                        }
                      />
                    ),
                  };

                  if (mode === 2) {
                    row.viewdocument = doc._backendFileUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          downloadFileFromUrl(
                            {
                              _backendFileUrl: doc._backendFileUrl,
                              fileType: doc.fileType,
                              documentName: doc.documentName,
                            },
                            translate
                          )
                        }
                        className="btn btn-sm btn-outline-primary"
                      >
                        {translate("Download")}
                      </button>
                    ) : (
                      <span>{translate("")}</span>
                    );
                  }
                  return row;
                })}
                keyMapping={tableKeyMapping}
                showCheckboxInHeader={false}
                noDataMessage={translate("कोणतेही कागदपत्र उपलब्ध नाही.")}
              />
            </Form>
          )}
        </Formik>
      ) : (
        <div>{translate("कोणतेही कागदपत्र उपलब्ध नाही.")}</div>
      )}
    </div>
  );
});

function FrmApplicationEntryMst() {
  const { translate } = useLanguage();
  const [key, setKey] = useState("prathmikMahiti");
  const ipAddress = useIP();
  const { user } = useAuth();
  const userId = user?.userId;
  const UlbId = user?.ulbId;
  const navigate = useNavigate();
  const { setLoading } = useLoader();
  // Access URL parameters for application ID
  const params = new URLSearchParams(location.search);
  const applicationId = params.get("applicationId");

  // Determine mode based on applicationId
  const mode = applicationId ? 2 : 1; // Mode 1 for New, 2 for Update

  const uploadFile = async (endpoint, formData) => {
    const fullUrl = `${API_BASE_URL}/${endpoint}`;
    console.log(
      `📡 Bypassing apiService - Direct POST (Multipart): ${fullUrl}`
    );

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        // IMPORTANT: Do NOT set Content-Type header.
        // The browser will automatically set 'multipart/form-data'
        // with the boundary when 'body' is a FormData object.
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `HTTP Error for ${endpoint}: ${response.status} - ${errorText}`
        );
        // Throw a custom error that can be caught later
        throw new Error(`File upload failed with status ${response.status}.`);
      }

      // Assuming the file upload endpoints return standard JSON like shown in your images:
      // { success: true, message: "..." }
      const data = await response.json();
      return { data: data };
    } catch (error) {
      console.error(`❌ Network or Parsing Error for ${endpoint}:`, error);
      throw error;
    }
  };

  console.log(
    "FrmApplicationEntryMst - Component Mounted/Rendered. UlbId:",
    UlbId
  );
  console.log(
    "FrmApplicationEntryMst - Application ID from URL:",
    applicationId
  );
  console.log("FrmApplicationEntryMst - Mode:", mode);

  const prathmikMahitiTabRef = useRef(null);
  const sanchalakMahitiTabRef = useRef(null);
  const kagadpatraJodaneTabRef = useRef(null);
  const approvalFormikRef = useRef(null); // Assuming this ref is used elsewhere for an approval section

  const handleMainApplicationSubmit = async () => {
    // Good for debugging, remove in production
    let isValid = true;
    let prathmikMahitiValues = {};
    let tradeRateList = [];
    let selectedTradeIds = [];

    console.log("--- Starting Main Application Submission ---");

    // 1. Collect and validate data from PrathmikMahitiTab
    if (prathmikMahitiTabRef.current) {
      await prathmikMahitiTabRef.current.submit(); // Ensure this triggers validation
      prathmikMahitiValues = prathmikMahitiTabRef.current.getValues();
      tradeRateList = prathmikMahitiTabRef.current.getTradeRateList();
      selectedTradeIds = prathmikMahitiTabRef.current.getSelectedTradeIds();

      const prathmikMahitiIsValid =
        await prathmikMahitiTabRef.current.isValid();

      console.log(
        "FrmApplicationEntryMst - PrathmikMahitiTab Values:",
        prathmikMahitiValues
      );
      console.log(
        "FrmApplicationEntryMst - PrathmikMahitiTab Valid:",
        prathmikMahitiIsValid
      );

      if (!prathmikMahitiIsValid) {
        isValid = false;
        alert(translate("कृपया 'प्राथमिक माहिती' टॅबमधील त्रुटी दूर करा."));
        setKey("prathmikMahiti"); // Redirect to the tab
        return; // Stop execution if validation fails
      }

      // --- NEW VALIDATION FOR ARREARS AMOUNT ---
      if (
        !prathmikMahitiValues.ArrearsAmount ||
        prathmikMahitiValues.ArrearsAmount === "" ||
        prathmikMahitiValues.ArrearsAmount <= 0
      ) {
        isValid = false;
        alert(translate("|| Please Enter Areas Amount ||"));
        setKey("prathmikMahiti"); // Redirect to the tab where this field is located
        return; // Stop execution
      }
      // --- END NEW VALIDATION ---
    } else {
      console.warn(
        "FrmApplicationEntryMst - PrathmikMahitiTab ref is null. Cannot get values."
      );
      isValid = false;
      alert(translate("प्राथमिक माहिती टॅब लोड झालेला नाही."));
      setKey("prathmikMahiti"); // Redirect to the tab
      return;
    }

    // Auto-indexed In_Applitrade_Str formatting (1$rate#2$rate#...)
    // const In_Applitrade_Str_Formatted = tradeRateList
    //   .map((item, index) => `${index + 1}$${item.tradeId}`)
    //   .join("#");
    
    const In_Applitrade_Str_Formatted = selectedTradeIds
      .map((tradeId, index) => `${tradeId}`)
      .join("#");
    
    // Format trade rate list and selected trade IDs for payload
    const In_Applitradetype_Str_Formatted = tradeRateList
      .map((item) => `${item.tradeTypeId}$${item.rate}`)
      .join("#");

    // 2. Collect data from SanchalakMahitiTab
    let directorsData = [];
    if (sanchalakMahitiTabRef.current) {
      directorsData = sanchalakMahitiTabRef.current.getDirectorList();
      console.log(
        "FrmApplicationEntryMst - SanchalakMahitiTab ref available. Collected directorsData:",
        directorsData
      );
      if (!directorsData || directorsData.length === 0) {
        isValid = false;
        alert("|| Please Add At least One Director ||");
        setKey("sanchalakMahiti"); // Redirect to the tab 
        return; // Stop execution
      }
    } else {
      console.warn(
        "FrmApplicationEntryMst - sanchalakMahitiTabRef.current is null. SanchalakMahitiTab might not be rendered or ref not attached. This should be prevented by unmountOnExit={false}."
      );
      isValid = false;
      alert(
        translate(
          "संचालक माहिती टॅब लोड झालेला नाही. कृपया 'संचालक माहिती' टॅब तपासा."
        )
      );
      setKey("sanchalakMahiti"); // Redirect to the tab
      return;
    }
    // Format directors data for payload
    const In_Applidirector_Str_Formatted = directorsData
      .map((director, index) => {
        const directorId = director.DIRECTORID || index + 1; // Use sequential index if no ID

        return `${directorId}$${director.DIRCTORNAME || ""}$${
          director.VOTERID || ""
        }$${director.ADDRESS || ""}$${director.MOBILENO || ""}$${
          director.EMAIL || ""
        }$${director.GENDER || ""}$${director.APPLITYPEID || ""}$${
          director.ADHARNO || ""
        }`;
      })
      .join("#");

    console.log(
      "FrmApplicationEntryMst - Formatted In_Applidirector_Str:",
      In_Applidirector_Str_Formatted
    );
    // 3. Collect data from KagadpatraJodaneTab (This will now include Base64 imageBuffer and fileType)
    let documentDetails = [];
    if (kagadpatraJodaneTabRef.current) {
      documentDetails =
        await kagadpatraJodaneTabRef.current.getDocumentDetails();
      console.log(
        "FrmApplicationEntryMst - KagadpatraJodaneTab data collected (including Base64 and file types):",
        documentDetails
      );

      const docsToUpload = documentDetails.filter((doc) => doc.file);

      if (docsToUpload.length === 0) {
        isValid = false;
        // Use the translate function for the alert message
        alert(translate("|| Please Upload At least One Document ||"));
        setKey("kagadpatraJodane"); // Redirect the user to the correct tab
        return; // Stop the submission process
      }
    } else {
      console.warn(
        "FrmApplicationEntryMst - kagadpatraJodaneTabRef.current is null. This indicates the KagadpatraJodaneTab component might not be mounted or has unmounted."
      );
      // If this tab is mandatory for submission, add an alert and stop.
      isValid = false;
      alert(translate("कागदपत्र जोडणे टॅब लोड झालेले नाही."));
      setKey("kagadpatraJodane"); // Redirect to the tab
      return; // Stop submission
    }

    // Handle approval status and remark if applicable (from your existing code)
    // This section assumes an 'approvalFormikRef' is set up for an approval tab/component
    let approvalStatus = "A"; // Default to 'Approved'
    let rejectionRemark = "";

    if (approvalFormikRef.current) {
      // Ensure these fields exist on your approvalFormikRef.current.values
      approvalStatus = approvalFormikRef.current.values.approvalStatus;
      rejectionRemark = approvalFormikRef.current.values.rejectionRemark;

      if (approvalStatus === "R" && !rejectionRemark.trim()) {
        isValid = false;
        alert(translate("कृपया रद्द करण्याचे कारण प्रविष्ट करा."));
        setKey("approvalTabNameIfItExists"); // Redirect to approval tab if relevant
        return;
      }
    } else {
      console.warn(
        "FrmApplicationEntryMst - Approval Formik ref is null. Cannot get approval status/remark."
      );
      // Decide if this is a critical error or if approval fields are optional
    }

    // Proceed with main submission if all data is valid
    if (isValid) {
      const formatToDDMMMYYYY = (date) => {
        if (!date) return null;

        if (date instanceof Date) {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          const year = date.getFullYear();
          // getMonth() is 0-indexed, so we use it directly to access the array
          const monthName = months[date.getMonth()];
          // getDate() returns the day of the month (1-31)
          const day = String(date.getDate()).padStart(2, "0");

          // Construct the DD MMM YYYY string
          return `${day}-${monthName}-${year}`;
        }

        // Return as is if not a Date object, assuming it's already in correct format or null
        return date;
      };

      debugger;
      const finalPayload = {
        In_UserId: userId,
        In_Appid: applicationId || null, // Use 0 for new applications, actual ID for updates
        In_Mode: mode,
        In_OldLicencNo: prathmikMahitiValues.licenseNo || "1",
        In_ShopName: prathmikMahitiValues.EngShopName,
        In_PANNo: prathmikMahitiValues.PanCard,
        In_ContactNo: Number(prathmikMahitiValues.ContactNo),
        In_Email: prathmikMahitiValues.Email,
        In_Address: prathmikMahitiValues.ShopAddress,
        In_ZoneId: Number(prathmikMahitiValues.ZoneNo),
        In_WardId: Number(prathmikMahitiValues.WardNo),
        In_IsProd:
          prathmikMahitiValues.isItemManufactured === "yes" ? "Y" : "N",
        In_OwnSpace:
          prathmikMahitiValues.isOwnBrandBusinessNo === "OWNER" ? "Y" : "N",
        In_Agrmentwith: prathmikMahitiValues.OwnerName, // Renamed from agreementWith
        In_Area: Number(prathmikMahitiValues.UsedArea),
        In_IsCorpNOC:
          prathmikMahitiValues.NoObjectionCertificate === "yes" ? "Y" : "N",
        In_BusStartYr: Number(prathmikMahitiValues.YearOfCommencement),
        In_ShopActNo: prathmikMahitiValues.FormNo,
        In_foodlicno: prathmikMahitiValues.NondaniFormNo || null,
        In_LicDays: 365, // As per original, set to null
        In_Applitrade_Str: In_Applitrade_Str_Formatted,
        In_Applitradetype_Str: In_Applitradetype_Str_Formatted,
        In_Applidirector_Str: In_Applidirector_Str_Formatted,
        In_Source: "DEPT", // Assuming "DEPT" as a constant source
        In_ShopNameMar: prathmikMahitiValues.MarShopName,
        In_PlaceOwnerName: prathmikMahitiValues.OwnerName, // Assuming this is distinct from In_Agrmentwith
        In_PlaceOwnerAddress: prathmikMahitiValues.OwnerAddress,
        In_FromDate: formatToDDMMMYYYY(prathmikMahitiValues.fromDate),
        In_ToDate: formatToDDMMMYYYY(prathmikMahitiValues.toDate),
        in_amount: prathmikMahitiValues.amount,
        in_lictype: "N", // As per original, set to 'N'
        in_licensetypeid: Number(prathmikMahitiValues.LicenseType),
        In_OrgId: Number(UlbId),
        in_arreasamt: Number(prathmikMahitiValues.ArrearsAmount),
        in_Servid: "", // As per original, set to null
        in_CFCRecno: "", // As per original, set to null
        in_ipaddr: ipAddress, // Hardcoded IP, consider making dynamic if needed
      };

      console.log(
        "FrmApplicationEntryMst - Final Combined Payload for Main API:",
        finalPayload
      );
      setLoading(true);
      try {
        const response = await apiService.post(`aomk_appli_ins`, finalPayload);
        console.log(
          "FrmApplicationEntryMst - Application authorization response:",
          response.data
        );
        console.log(finalPayload);

        if (response.data.OUT_ERRORCODE === 9999) {
          alert(translate(response.data.OUT_ERRORMSG));
          // Get the application ID from the response for new applications, or use existing for updates
          const submittedApplicationId =
            applicationId || response.data.OUT_APPID;
          console.log("Submitted Application ID:", submittedApplicationId);
          // --- Integrated Director Photo Upload Logic (Moved Here) ---
          if (directorsData.length > 0 && submittedApplicationId) {
            console.log("Attempting to upload director photos...");
            for (const director of directorsData) {
              // Check if a photo file was associated with this director when added
              if (director._photoFile) {
                console.log(
                  `Uploading photo for director: ${director.DIRCTORNAME}, ID: ${director.DIRECTORID}`
                );

                const blobFile = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const arrayBuffer = reader.result;
                    const blob = new Blob([arrayBuffer], {
                      type: director._photoFile.type,
                    });
                    resolve(blob);
                  };
                  reader.onerror = reject;
                  reader.readAsArrayBuffer(director._photoFile);
                });

                const formData = new FormData();

                formData.append("directorid", director.DIRECTORID);
                formData.append("appid", submittedApplicationId);
                formData.append(
                  "imagedata",
                  blobFile,
                  director._photoFile.name
                );

                try {
                  const uploadResponse = await uploadFile(
                    // Use the new function
                    `updateDirectorPhoto`,
                    formData
                  );

                  if (uploadResponse.data.success) {
                    console.log(
                      `Photo for director ${director.DIRCTORNAME} uploaded successfully.`
                    );
                  } else {
                    console.error(
                      `Photo upload failed for director ${director.DIRCTORNAME}:`,
                      uploadResponse.data.message
                    );
                    alert(
                      `Failed to upload photo for ${director.DIRCTORNAME}: ${
                        uploadResponse.data.message || "Unknown error"
                      }`
                    );
                  }
                } catch (error) {
                  console.error(
                    `Error uploading photo for director ${director.DIRCTORNAME}:`,
                    error
                  );
                  alert(
                    `Error uploading photo for ${director.DIRCTORNAME}. Please try again.`
                  );
                }
              } else {
                console.log(
                  `No photo file found for director: ${director.DIRCTORNAME}. Skipping photo upload.`
                );
              }
            }
            alert(translate("संचालकांचे फोटो अपलोड करणे पूर्ण झाले.")); // Overall message for director photos
          } else {
            console.log(
              "No directors added or application ID not available for director photo upload."
            );
          }
          // 1. Delete existing documents (if in update mode and documents exist)
          if (submittedApplicationId) {
            // Only attempt delete if in update mode (applicationId exists)
            // and if there were *any* documents collected from the tab (indicating it loaded)
            if (applicationId && documentDetails.length > 0) {
              console.log(
                "Attempting to delete existing documents for Application ID:",
                submittedApplicationId
              );
              try {
                const deleteResponse = await apiService.post(`DeleteDocument`, {
                  applicationId: submittedApplicationId,
                });
                console.log(
                  "DeleteDocument API response:",
                  deleteResponse.data
                );
                if (deleteResponse.data.success) {
                  alert(translate("मागील कागदपत्रे यशस्वीरित्या हटवली गेली."));
                } else {
                  console.warn(
                    "DeleteDocument API returned success: false or unexpected response.",
                    deleteResponse.data.message
                  );
                  alert(
                    translate(
                      `मागील कागदपत्रे हटवताना त्रुटी आली: ${
                        deleteResponse.data.message || "अज्ञात त्रुटी"
                      }`
                    )
                  );
                }
              } catch (deleteError) {
                console.error("Error calling DeleteDocument API:", deleteError);
                alert(
                  translate(
                    "कागदपत्रे हटवताना नेटवर्क किंवा सर्व्हर त्रुटी आली."
                  )
                );
              }
            } else {
              console.log(
                "No existing documents to delete or not in update mode."
              );
            }

            const docsToUpload = documentDetails.filter((doc) => doc.file);

            if (docsToUpload.length > 0) {
              console.log(
                "Attempting to insert new documents (FormData/multipart)..."
              );

              for (const doc of docsToUpload) {
                if (!(doc.file instanceof File)) {
                  console.warn(
                    `Skipping ${doc.documentName} — no valid file selected.`
                  );
                  continue;
                }

                const formData = new FormData();
                formData.append("primaryDocId", doc.documentId);
                formData.append("appliId", submittedApplicationId); // or applilid if backend expects that exact key
                formData.append("docId", doc.documentId);
                formData.append("fileType", doc.file.type.split("/").pop()); // 'pdf', 'png' etc.
                formData.append("blobDocFile", doc.file, doc.file.name);

                try {
                  const uploadResponse = await uploadFile(
                    "insertApplicationDocument",
                    formData
                  );
                  console.log(
                    `Document ${doc.documentName} upload response:`,
                    uploadResponse.data
                  );

                  if (uploadResponse.data.success) {
                    console.log(`✅ Uploaded ${doc.documentName}`);
                  } else {
                    console.error(
                      `❌ Failed ${doc.documentName}: ${uploadResponse.data.message}`
                    );
                  }
                } catch (err) {
                  console.error(`🚨 Error uploading ${doc.documentName}:`, err);
                }
              }

              alert(translate("कागदपत्रे यशस्वीरित्या अपलोड केली!"));
              navigate("/Transaction/FrmApplicationEntryList.aspx"); // Inform user about overall upload status
            } else {
              console.log("No new documents selected or converted for upload.");
            }
          } else {
            console.warn(
              "Application ID not available for document operations (this shouldn't happen if primary submission was successful)."
            );
          }
        } else {
          // Handle main application submission error
          alert(
            translate(
              response.data.OUT_ERRORMSG || "अर्ज अधिकृत करताना त्रुटी आली."
            )
          );
          navigate("/Transaction/FrmApplicationEntryList.aspx");
        }
      } catch (error) {
        console.error(
          "FrmApplicationEntryMst - Error authorizing main application or network issue:",
          error
        );
        const errorMessage =
          error.response?.data?.Out_Errormsg || error.message;
        alert(
          translate(
            `अर्ज अधिकृत करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा. ${errorMessage}`
          )
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <Container className="mt-4">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्ज नोंदणी मास्टर")}
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
            {/* Add Approval Tab if applicable and pass approvalFormikRef */}
            {/* <Nav.Item>
              <Nav.Link eventKey="approvalTabNameIfItExists">
                {translate("मंजुरी")}
              </Nav.Link>
            </Nav.Item> */}
          </Nav>
          <Tab.Content className="mt-3">
            <Tab.Pane eventKey="prathmikMahiti" unmountOnExit={false}>
              <PrathmikMahitiTab
                UlbId={UlbId}
                applicationId={applicationId}
                ref={prathmikMahitiTabRef}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="sanchalakMahiti" unmountOnExit={false}>
              <SanchalakMahitiTab
                UlbId={UlbId}
                applicationId={applicationId}
                ref={sanchalakMahitiTabRef}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="kagadpatraJodane" unmountOnExit={false}>
              <KagadpatraJodaneTab
                applicationId={applicationId}
                mode={mode}
                ref={kagadpatraJodaneTabRef}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
          <SaveButton
            type="submit"
            text={translate("अर्ज जतन करा")}
            onClick={handleMainApplicationSubmit}
          />
          <SaveButton
            type="button"
            text={translate("बंद")}
            onClick={() =>
              navigate("/Transaction/FrmApplicationEntryList.aspx")
            }
          />
        </div>
      </Container>
    </div>
  );
}

export default FrmApplicationEntryMst;
