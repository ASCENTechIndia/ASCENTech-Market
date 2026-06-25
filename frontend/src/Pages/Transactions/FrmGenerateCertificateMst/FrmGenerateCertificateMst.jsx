import React, { useState, useEffect, useRef, useImperativeHandle } from "react"; // Added useEffect for potential API calls
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useAuth } from "../../../Context/AuthContext";
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
import apiService from "../../../../apiService";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = "http://localhost:5000";

const PrathmikMahitiTab = ({ UlbId, applicationId }) => {
  const { translate } = useLanguage();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [tradeCategories, setTradeCategories] = useState([]);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [selectedTradeTypeId, setSelectedTradeTypeId] = useState("");
  const [selectedTradeCategoryId, setSelectedTradeCategoryId] = useState(null);
  const [tradeTypes, setTradeTypes] = useState([]);
  const [selectedZoneValue, setSelectedZoneValue] = useState("");
  const [tradeRateList, setTradeRateList] = useState([]);
  const [tradeList, setTradeList] = useState([]);
  const [selectedTradeIds, setSelectedTradeIds] = useState([]); // Stores the trade IDs from the application details
  const [zoneOptions, setZoneOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [selectedWardValue, setSelectedWardValue] = useState(null);

  const [applicationData, setApplicationData] = useState({
    ShopName: "",
    PanCard: "",
    ContactNo: "",
    Email: "",
    ShopAddress: "",
    WardNo: "",
    ZoneNo: "",
    amount: "",
    TradeCategory: "",
    TradeType: "",
    Rate: "",
    isItemManufactured: "",
    isOwnBrandBusinessNo: "",
    AggrementType: "",
    UsedArea: "",
    YearOfCommencement: "",
    FormNo: "",
    NoObjectionCertificate: "",
    NondaniFormNo: "",
    LicenseDys: "",
    JavakNo: "",
  });


// ---------------------- APPLICATION DETAILS ----------------------
useEffect(() => {
  const fetchApplicationDetails = async () => {
    if (!applicationId || !UlbId) {
      setApplicationData({});
      setSelectedWardValue("");
      setSelectedZoneValue("");
      return;
    }

    try {
      const { data } = await apiService.post(`get-application-details`, {
        AppliList_AppId: applicationId,
        OrgId: UlbId,
      });

      if (!data) {
        setApplicationData({});
        setSelectedWardValue("");
        setSelectedZoneValue("");
        return;
      }

      setApplicationData({
        licenseNo: "",
        ShopName: data.VAR_APPLI_SHOPNAME || "",
        PanCard: data.VAR_APPLI_PANNO || "",
        ContactNo: data.NUM_APPLI_CONTACTNO || "",
        Email: data.VAR_APPLI_EMAIL || "",
        ShopAddress: data.VAR_APPLI_ADDRESS || "",
        WardNo: data.NUM_APPLI_WARDID || "",
        ZoneNo: data.NUM_APPLI_ZONEID || "",
        amount: data.AMOUNT || 0,
        isItemManufactured: data.VAR_APPLI_ISPROD === "Y" ? "yes" : "no",
        isOwnBrandBusinessNo: data.VAR_APPLI_OWNSPACE === "Y" ? "yes" : "no",
        OwnerName: data.VAR_APPLI_PLACEOWNERNAME || "",
        OwnerAddress: data.VAR_APPLI_PLACEOWNERADDRESS || "",
        AggrementType: data.VAR_APPLI_AGRMENTWITH || "",
        UsedArea: data.NUM_APPLI_AREA || "",
        YearOfCommencement: data.NUM_APPLI_BUSSTARTYR || "",
        FormNo: data.VAR_APPLI_SHOPACTNO || "",
        NoObjectionCertificate: data.VAR_APPLI_ISCORPNOC === "Y" ? "yes" : "no",
        NondaniFormNo: data.VAR_APPLI_FOODLICNO || "",
      });

      setSelectedWardValue(String(data.NUM_APPLI_WARDID || ""));
      setSelectedZoneValue(String(data.NUM_APPLI_ZONEID || ""));
    } catch (error) {
      console.error("Error fetching application details:", error);
      alert("Failed to load application details.");
      setApplicationData({});
      setSelectedWardValue("");
      setSelectedZoneValue("");
    }
  };

  fetchApplicationDetails();
}, [applicationId, UlbId]);

// ---------------------- WARD OPTIONS ----------------------
useEffect(() => {
  const fetchWardData = async () => {
    if (!UlbId) return;

    setLoadingWards(true);
    try {
      const { data } = await apiService.post("getWardName", { ulbId: UlbId });
      const wardData = data?.data?.map((w) => ({
        label: w.WARDNAME,
        value: String(w.WARDID),
      })) || [];

      setWardOptions(wardData);
      if (wardData.length === 1) setSelectedWardValue(wardData[0].value);
    } catch (err) {
      console.error("Error fetching ward data:", err);
      alert("Failed to load ward data.");
      setWardOptions([]);
    } finally {
      setLoadingWards(false);
    }
  };

  fetchWardData();
}, [UlbId]);

// ---------------------- ZONE OPTIONS ----------------------
useEffect(() => {
  if (!selectedWardValue || !UlbId) {
    setZoneOptions([]);
    return;
  }

  const fetchZoneData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getDistinctZones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wardId: selectedWardValue, ulbId: UlbId }),
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const result = await response.json();
      const mappedZones = (result.data || [])
        .filter((zone) => zone.ZONEID != null)
        .map((zone) => ({
          label: zone.ZONENAME,
          value: String(zone.ZONEID),
        }));

      setZoneOptions(mappedZones);
    } catch (error) {
      console.error("Error fetching zone data:", error);
      setZoneOptions([]);
    }
  };

  fetchZoneData();
}, [selectedWardValue, UlbId]);

// ---------------------- TRADE LIST & SELECTED TRADES ----------------------
useEffect(() => {
  const fetchTradesAndSelected = async () => {
    if (!UlbId || !applicationId) return;

    try {
      const [tradeListRes, appTradeDetailsRes] = await Promise.all([
        apiService.post("getTradeTypes", { ulbId: UlbId }),
        apiService.post("getApplicationTradeDetailsByAppId", { applicationId }),
      ]);

      setTradeList(tradeListRes?.data?.data || []);
      setSelectedTradeIds(
        appTradeDetailsRes?.data?.data?.map((item) => String(item.NUM_APPLITRADE_TRADEID)) || []
      );
    } catch (error) {
      console.error("Error fetching trade data:", error);
      alert("Failed to load trade data.");
      setTradeList([]);
      setSelectedTradeIds([]);
    }
  };

  fetchTradesAndSelected();
}, [UlbId, applicationId]);

const handleTradeCheckboxChange = (tradeId) => {
  setSelectedTradeIds((prevSelected) =>
    prevSelected.includes(tradeId)
      ? prevSelected.filter((id) => id !== tradeId)
      : [...prevSelected, tradeId]
  );
};

// ---------------------- TRADE CATEGORIES ----------------------
useEffect(() => {
  const fetchTradeCategories = async () => {
    if (!UlbId) return;
    setLoadingTrades(true);
    try {
      const { data } = await apiService.post("TradeCategory", { org_id: UlbId });
      const tradeData = data?.data?.map((t) => ({
        label: t.TRADECATEGORYNAME,
        value: String(t.TRADECATEGORYID),
      })) || [];

      setTradeCategories(tradeData);
    } catch (err) {
      console.error("Error fetching trade categories:", err);
      alert("Failed to load trade category data.");
      setTradeCategories([]);
    } finally {
      setLoadingTrades(false);
    }
  };

  fetchTradeCategories();
}, [UlbId]);

// ---------------------- TRADE TYPES BY CATEGORY ----------------------
useEffect(() => {
  const fetchTradeTypes = async () => {
    if (!selectedTradeCategoryId || !UlbId) {
      setTradeTypes([]);
      return;
    }

    try {
      const { data } = await apiService.post("getTradeTypesByCategory", {
        tradeCategoryId: selectedTradeCategoryId,
        ulbId: UlbId,
      });

      const mappedTypes = data?.data?.map((type) => ({
        label: type.NUM_RATE_TRADETYPENAME,
        value: String(type.TRADETYPEID),
      })) || [];

      setTradeTypes(mappedTypes);
    } catch (err) {
      console.error("Error fetching trade types:", err);
      alert("Failed to load trade types.");
      setTradeTypes([]);
    }
  };

  fetchTradeTypes();
}, [selectedTradeCategoryId, UlbId]);

// ---------------------- TRADE RATE DETAILS ----------------------
useEffect(() => {
  const fetchTradeRateDetails = async () => {
    if (!applicationId || !UlbId) return;

    try {
      const { data } = await apiService.post("getAppliTradeTypeDetails", {
        applicationId,
        ulbId: UlbId,
      });

      const tradeRates = data?.data?.map((item) => ({
        tradeTypeId: item.TRADETYPEID,
        tradeTypeName: item.TRADETYPENAME,
        rate: item.RATE,
      })) || [];

      setTradeRateList(tradeRates);
      setSelectedTradeIds(tradeRates.map((item) => String(item.tradeTypeId)));
    } catch (err) {
      console.error("Error fetching trade rate details:", err);
      setTradeRateList([]);
      setSelectedTradeIds([]);
    }
  };

  fetchTradeRateDetails();
}, [applicationId, UlbId]);



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
  return (
    <Formik enableReinitialize={true} initialValues={applicationData}>
      {({ setFieldValue, values, errors, touched }) => (
        <Form>
          {/* First Row: License No. & Old License No. */}
          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label text={`${translate("दुकानाचे नाव")} :`} />
              <Field
                name="ShopName"
                component={InputField}
                className="form-control"
                type="text"
                disabled
              />
              <ErrorMessage
                name="ShopName"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("पॅनकार्ड")} :`} required />
              <Field
                name="PanCard"
                component={InputField}
                className="form-control"
                type="text"
                disabled
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
                type="text"
                disabled
              />
              <ErrorMessage
                name="ContactNo"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label text={`${translate("ई-मेल")} :`} required />
              <Field
                name="Email"
                component={InputField}
                className="form-control"
                type="text"
                disabled
              />
              <ErrorMessage
                name="Email"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("दुकानाचा पत्ता")} :`} required />
              <Field
                name="ShopAddress"
                component={InputField}
                className="form-control"
                type="text"
                disabled
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
                disabled
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
          </div>

          <div className="row mb-3 ">
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
            <div className="col-md-4">
              <Label text={`${translate("रक्कम")} :`} required />
              <Field
                name="amount"
                component={InputField}
                type="number"
                placeholder={translate("रक्कम")}
                disabled
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
                disabled
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
          </div>

          <div className="row mb-3 align-items-end">
            <div className="col-md-4">
              <Label text={`${translate("Trade Type")} :`} required />
              <Field
                name="TradeType"
                component={InputField}
                className="form-control"
                disabled
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
            <div className="col-md-4">
              <Label text={`${translate("Rate")} :`} required />
              <Field
                name="Rate"
                component={InputField}
                type="number"
                placeholder={translate("रक्कम")}
                disabled
              />
              <ErrorMessage
                name="Rate"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <SaveButton
                type="button"
                text={translate("Add To List")}
                onClick={() => handleAddTradeRateToList(values, setFieldValue)}
              />{" "}
            </div>
          </div>

          {/* Submit and Back Buttons */}

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
                    disabled={true}
                  />
                  <Field
                    name="isItemManufactured"
                    component={RadioButton}
                    label={translate("नाही")}
                    value="no"
                    id="isItemManufacturedNo"
                    disabled={true}
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
                    disabled={true}
                  />
                  <Field
                    name="isOwnBrandBusinessNo"
                    component={RadioButton}
                    label={translate("नाही")}
                    value="no"
                    id="isOwnBrandBusinessNo"
                    disabled={true}
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
              <Label
                text={`${translate("भाडे करार कोणासोबत केलेला आहे")} :`}
                required
              />
              <Field
                name="AggrementType"
                component={InputField}
                className="form-control"
                type="text"
                disabled
              />
              <ErrorMessage
                name="AggrementType"
                component="div"
                className="text-danger"
              />
            </div>
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
                disabled
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
                disabled
              />
              <ErrorMessage
                name="YearOfCommencement"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label text={`${translate("शॉप ऍक्ट नोंदणी क्र.")} :`} required />
              <Field
                name="FormNo"
                component={InputField}
                className="form-control"
                type="text"
                disabled
              />
              <ErrorMessage
                name="FormNo"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-8 mt-4">
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
                    disabled={true}
                  />
                  <Field
                    name="NoObjectionCertificate"
                    component={RadioButton}
                    label={translate("नाही")}
                    value="no"
                    id="NoObjectionCertificate"
                    disabled={true}
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
                disabled
              />
              <ErrorMessage
                name="NondaniFormNo"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label
                text={`${translate("परवाना किती दिवसाकरिता पाहिजे")} :`}
                required
              />
              <Field
                name="LicenseDys"
                component={InputField}
                className="form-control"
                type="text"
                disabled
              />
              <ErrorMessage
                name="LicenseDys"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("जावक क्र.")} :`} required />
              <Field
                name="JavakNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="JavakNo"
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
};


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
    const [nextTempDirectorId, setNextTempDirectorId] = useState(1); // For newly added directors before they get a real ID

    const formikRef = useRef(); // Ref to hold Formik's internal methods

    // Expose methods to the parent component via the ref
    useImperativeHandle(ref, () => ({
      submit: () => {
        // This will trigger the Formik's onSubmit handler
        formikRef.current?.submitForm();
      },
      getValues: () => formikRef.current?.values,
      isValid: () => formikRef.current?.isValid, // If you have validation schema set up
      getDirectorList: () => {
        console.log(
          "SanchalakMahitiTab - getDirectorList() called, returning:",
          directorList
        );
        return directorList; // Return the current state of directorList
      },
      resetForm: () => {
        // Added for completeness, if you want to reset from parent
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
            setApplicationTypes([]); // Ensure it's an empty array
          }
        } catch (error) {
          console.error(
            "SanchalakMahitiTab - Error fetching application types:",
            error
          );
          setApplicationTypes([]); // Ensure it's an empty array on error
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
          setDirectorList([]); // Ensure list is empty if no applicationId
          return;
        }

        try {
          const response = await apiService
          .post(
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

            const maxExistingId = response.data.data.reduce(
              (maxId, director) => {
                const idAsNumber = parseInt(director.DIRECTORID, 10);
                return !isNaN(idAsNumber) ? Math.max(maxId, idAsNumber) : maxId;
              },
              0
            );

            setNextTempDirectorId(maxExistingId + 1);
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
          setDirectorList([]); // Ensure list is empty on error
        }
      };

      fetchDirectorDetails(); // Call on mount and when applicationId changes
    }, [applicationId]);

    // Log directorList state changes for debugging
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

    return (
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        innerRef={formikRef} // Attach the ref here
        onSubmit={(_, { setSubmitting }) => {
          // This Formik onSubmit is typically for the form's values, not the directorList directly
          // However, if you passed an onSubmit prop from parent, you can use it here
          if (onSubmit) {
            onSubmit(directorList); // Pass the current directorList state up to the parent
          }
          setSubmitting(false); // Reset submitting state
        }}
      >
        {({ values, setFieldValue }) => (
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
                  type="text"
                  disabled
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("संचालकांचा नाव")} :`} required />
                <Field
                  name="SanchalakName"
                  component={InputField}
                  className="form-control"
                  type="text"
                  disabled
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("संपर्क क्र.")} :`} required />
                <Field
                  name="ContactNo"
                  component={InputField}
                  className="form-control"
                  type="text"
                  disabled
                />
              </div>
            </div>
            <div className="row mb-3 mt-4">
              <div className="col-md-4">
                <Label text={`${translate("ई-मेल")} :`} required />
                <Field
                  name="Email"
                  component={InputField}
                  className="form-control"
                  type="text"
                  disabled
                />
              </div>
              <div className="col-md-4">
                <Label text={`${translate("पत्ता")} :`} required />
                <Field
                  name="Address"
                  component={InputField}
                  className="form-control"
                  type="text"
                  disabled
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
                      disabled={true}
                    />
                    <Field
                      name="Gender"
                      component={RadioButton}
                      label={translate("पुरुष")}
                      value="M"
                      id="genderMale"
                      checked={values.Gender === "M"}
                      disabled={true}
                    />
                    <Field
                      name="Gender"
                      component={RadioButton}
                      label={translate("ईतर")}
                      value="O"
                      id="genderOther"
                      checked={values.Gender === "O"}
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-3 mt-4">
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
              <div className="col-md-4 mt-3">
                <Label text={`${translate("संचालकाचां फोटो")} :`} required />
                <FileUpload
                  name="directorPhoto"
                  setFieldValue={setFieldValue}
                  disabled
                />
              </div>
            </div>
            <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5"></div>

            {/* Table Section */}
            {directorList.length > 0 ? (
              <div className="certi_change_table mt-4">
                <Table
                  headers={[
                    translate("आधार क्र."),
                    translate("संचालकांचे नांव"),
                    translate("मोबाईल क्र."),
                    translate("ई-मेल"),
                    translate("लिंग"),
                    translate("पत्ता"),
                    translate("अर्जदाराचा प्रकार"),
                    translate("संचालकांचे छायाचित्र"),
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
                              ? director.directorImage
                              : director.directorImage // If it's not a blob URL, assume it's a relative path from API
                              ? `${API_BASE_URL}${director.directorImage}`
                              : "path/to/default/image.png" // Fallback for null/empty image
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
                  }))}
                  keyMapping={{
                    [translate("आधार क्र.")]: translate("आधार क्र."),
                    [translate("संचालकांचे नांव")]:
                      translate("संचालकांचे नांव"),
                    [translate("मोबाईल क्र.")]: translate("मोबाईल क्र."),
                    [translate("ई-मेल")]: translate("ई-मेल"),
                    [translate("लिंग")]: translate("लिंग"),
                    [translate("पत्ता")]: translate("पत्ता"),
                    [translate("अर्जदाराचा प्रकार")]:
                      translate("अर्जदाराचा प्रकार"),
                    [translate("संचालकांचे छायाचित्र")]: translate(
                      "संचालकांचे छायाचित्र"
                    ),
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
const KagadpatraJodaneTab = React.forwardRef(({ applicationId }, ref) => {
  const { translate } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleDownload = (row) => {
    const fileUrl = row.fileUrl;

    if (fileUrl) {
      const fullUrl = fileUrl.startsWith("/")
        ? `${API_BASE_URL}${fileUrl}`
        : fileUrl;
      const fileName = `${row.DOCTYPENAME || "document"}${
        row.FILETYPE || ".file"
      }`;

      const link = document.createElement("a");
      link.href = fullUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(
        `KagadpatraJodaneTab: Attempting to download from: ${fullUrl} as ${fileName}`
      );
    } else {
      console.warn("KagadpatraJodaneTab: No file URL found for download:", row);
    }
  };

  const tableHeaders = [
    translate("दस्ताऐवजाचे नाव"),
    translate("शेरा"),

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

    [translate("Download")]: "Download",
  };

  // Expose methods to the parent component using useImperativeHandle
  useImperativeHandle(ref, () => ({
    getDocumentDetails: () => documents, // Expose the full documents array
    // You might also want to expose a method for validation if there are validation rules for documents
    // isValid: () => { /* Add validation logic here based on documents state */ return true; }
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




function FrmGenerateCertificateMst() {
  const { translate } = useLanguage();
  const [key, setKey] = useState("prathmikMahiti");
  const navigate = useNavigate();
  const { user } = useAuth();

  const userId = user?.userId;
  const UlbId = user?.ulbId;

  const params = new URLSearchParams(location.search);
  const applicationId = params.get("applicationId");

  const [retrievedLicenseNo, setRetrievedLicenseNo] = useState(null);
  const [prathmikMahitiData, setPrathmikMahitiData] = useState(null);
  const [directorList, setDirectorList] = useState([]);

  const prathmikMahitiRef = useRef();
  const sanchalakMahitiRef = useRef();
  const kagadpatraJodaneRef = useRef();

  // ✅ Retrieve LicenseNo from localStorage
  useEffect(() => {
    const storedLicenseNo = localStorage.getItem("selectedLicenseNo");
    if (storedLicenseNo) {
      setRetrievedLicenseNo(storedLicenseNo);
      console.log("Retrieved licenseNo from localStorage:", storedLicenseNo);
    }
  }, []);

  // ✅ Optionally get director details dynamically from SanchalakMahitiTab
  const handleDirectorDataChange = (data) => {
    setDirectorList(data || []);
    console.log("Director data received:", data);
  };

  // ✅ Capture data from PrathmikMahitiTab
  const handlePrathmikMahitiData = (data) => {
    setPrathmikMahitiData(data);
    console.log("PrathmikMahitiTab data received:", data);
  };

  // ✅ Generate and Download Certificate PDF
  const handlePrintCertificate = async () => {
    debugger;
    try {
      if (!applicationId || !UlbId || !userId) {
        alert(translate("प्रमाणपत्र तयार करण्यासाठी आवश्यक माहिती अपूर्ण आहे."));
        return;
      }

      if (!retrievedLicenseNo) {
        alert(translate("परवाना क्रमांक उपलब्ध नाही. प्रमाणपत्र तयार करू शकत नाही."));
        return;
      }

      // ✅ Prepare dynamic director details (from state)
      const directorDetails = directorList?.length
        ? directorList.map((d) => ({
            name: d.name || "",
            designation: d.designation || "",
            dob: d.dob || null,
          }))
        : [
            {
              name: "Default Director",
              designation: "Director",
              dob: null,
            },
          ];

      // ✅ Create payload
      const payload = {
        appliId: Number(applicationId),
        ulbId: Number(UlbId),
        licenseNo: retrievedLicenseNo?.toString(),
        userId: userId,
        directorDetails,
      };

      console.log("📦 Sending Payload:", payload);
      const apiUrl = `${API_BASE_URL}/GenerateCertificate`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const blob = await response.blob();
      if (blob.type !== "application/pdf") {
        throw new Error("Invalid response: expected PDF format.");
      }

      // ✅ Trigger PDF download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `certificate_${applicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert(translate("प्रमाणपत्र यशस्वीरीत्या डाउनलोड झाले."));
      navigate("/Transaction/FrmGenerateCertificateList.aspx");
    } catch (error) {
      console.error("❌ Certificate download error:", error);
      alert(
        translate("प्रमाणपत्र डाउनलोड करताना त्रुटी आली:") +
          ` ${error.message || "Unknown error"}`
      );
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <Container className="mt-4">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("प्रमाणपत्र निर्मिती")}
        />
        <hr />
        <Tab.Container id="license-entry-tabs" activeKey={key} onSelect={(k) => setKey(k)}>
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
            <Tab.Pane eventKey="prathmikMahiti">
              <PrathmikMahitiTab
                UlbId={UlbId}
                applicationId={applicationId}
                ref={prathmikMahitiRef}
                onDataChange={handlePrathmikMahitiData}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="sanchalakMahiti">
              <SanchalakMahitiTab
                UlbId={UlbId}
                applicationId={applicationId}
                ref={sanchalakMahitiRef}
                onDataChange={handleDirectorDataChange}
              />
            </Tab.Pane>

            <Tab.Pane eventKey="kagadpatraJodane">
              <KagadpatraJodaneTab
                applicationId={applicationId}
                ref={kagadpatraJodaneRef}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <div className="d-flex justify-content-center gap-4 mt-5">
          <SaveButton
            type="button"
            text={translate("प्रमाणपत्र प्रिंट करा")}
            onClick={handlePrintCertificate}
          />
        </div>
      </Container>
    </div>
  );
}

export default FrmGenerateCertificateMst;



