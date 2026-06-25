import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { Nav, Tab, Container } from "react-bootstrap";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import { useAuth } from "../../../Context/AuthContext";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import FileUpload from "../../../Components/FileUpload/FileUpload";
import { ValidationSchemas } from "../../../HOC/Validation/Validation";
import useIP from "../../../Hooks/UseIp";
import { useLoader } from "../../../Context/LoaderContext";
import apiService from "../../../../apiService";

const PrathmikMahitiTab = forwardRef(
  (
    {
      applicationId,
      setFormData,
      setTradeData,
      setSelectedCheckboxData,
      onSubmit,
    },
    ref
  ) => {
    // ✅ Expose final submit function to parent
    useImperativeHandle(ref, () => ({
      triggerFinalSubmit: () => {
        if (onSubmit) {
          onSubmit();
        }
      },
    }));

    const { translate } = useLanguage();
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const { user } = useAuth();
    const { setLoading } = useLoader();
    const ulbId = user?.ulbId;
    const org_id = user?.ulbId;
    const [tradeCategoryOptions, setTradeCategoryOptions] = useState([]);
    const [tradeTypeOptions, setTradeTypeOptions] = useState([]);
    const [WardOptions, setWardOptions] = useState([]);
    const [ZoneOptions, setZoneOptions] = useState([]); // New state for Zone options
    const [tradeTypesWithFlagData, setTradeTypesWithFlagData] = useState([]);
    const [selectedTradeTypes, setSelectedTradeTypes] = useState({});
    const [autoSelectedTradeIds, setAutoSelectedTradeIds] = useState({});

    // Destructure setFieldValue from useFormikContext for easier access
    const { setFieldValue, values, errors, touched } = useFormikContext();
    const [leftTableData, setLeftTableData] = useState([]);

    useEffect(() => {
      const fetchAppliTradeTypeDetails = async () => {
        if (!applicationId || !ulbId) return;

        try {
          const response = await apiService.post(`getAppliTradeTypeDetails`, {
            applicationId,
            ulbId,
          });

          if (response.data && Array.isArray(response.data.data)) {
            const autofillData = response.data.data.map((item) => ({
              TRADETYPEID: item.TRADETYPEID,
              TRADERATE: item.RATE,
              tradeType: item.TRADETYPENAME,
              rate: item.RATE,
            }));

            setLeftTableData(autofillData);
          } else {
            console.warn("No valid trade type detail data returned.");
          }
        } catch (error) {
          console.error(
            "Error fetching application trade type details:",
            error
          );
        }
      };

      fetchAppliTradeTypeDetails();
    }, [applicationId, ulbId]);

    useEffect(() => {
      const totalAmount = leftTableData.reduce((sum, item) => {
        return sum + parseFloat(item.rate || 0);
      }, 0);
      setFieldValue("amount", totalAmount.toFixed(2));
    }, [leftTableData]);

    // --- useEffect to fetch Ward (Prabhag) and Zone Data ---
    useEffect(() => {
      const fetchWardAndZoneData = async () => {
        if (ulbId) {
          // Fetch Zone Data
          try {
            const zoneResponse = await apiService.post(`get-zones`, {
              ulbid: ulbId,
            });
            if (zoneResponse.data) {
              const options = zoneResponse.data.map((item) => ({
                value: item.ZONEID,
                label: item.ZONENAME,
              }));
              setZoneOptions(options);
            } else {
              console.warn("No Zone data received from API.");
            }
          } catch (error) {
            console.error("Error fetching Zone data:", error);
          }
        } else {
        }
      };

      // --- Fetch Trade Category ---
      const fetchTradeCategoryData = async () => {
        if (org_id) {
          try {
            const response = await apiService.post(`TradeCategory`, {
              org_id: org_id,
            });

            if (response.data && response.data.data) {
              const options = response.data.data.map((item) => ({
                value: item.TRADECATEGORYID,
                label: item.TRADECATEGORYNAME,
              }));
              setTradeCategoryOptions(options);
            } else {
              setTradeCategoryOptions([]);
              console.warn(
                "No 'data' array found in TradeCategory API response or response.data is null/undefined."
              );
            }
          } catch (error) {
            console.error("Error fetching Trade Category data:", error);
            setTradeCategoryOptions([]);
          }
        } else {
          console.log("Org ID not available to fetch Trade Category data.");
        }
      };

      fetchWardAndZoneData();
      fetchTradeCategoryData();
    }, [ulbId, org_id]);

    // --- Effect to fetch wards when ZoneNo changes ---
    useEffect(() => {
      const fetchWardsByZone = async () => {
        if (values.ZoneNo && ulbId) {
          try {
            const response = await apiService.post(`getWards`, {
              ulbid: ulbId,
              zoneid: values.ZoneNo,
            });
            if (response.data) {
              const options = response.data.map((item) => ({
                value: item.WARDID,
                label: item.WARDNAME,
              }));
              setWardOptions(options);
            } else {
              setWardOptions([]);
              console.warn("No Ward data received for selected Zone.");
            }
          } catch (error) {
            console.error("Error fetching Ward data by Zone:", error);
            setWardOptions([]);
          }
        } else {
          setWardOptions([]);
          setFieldValue("WardNo", "");
        }
      };

      fetchWardsByZone();
    }, [values.ZoneNo, ulbId, setFieldValue]);

    // --- New useEffect to fetch application details and autofill the form ---
    useEffect(() => {
      const fetchApplicationDetails = async () => {
        if (applicationId && ulbId) {
          try {
             setLoading(true);
            const response = await apiService.post(
              `getDetailedApplicationInfo`,
              {
                applicationId: applicationId,
                ulbId: ulbId,
              }
            );
            if (response.data && response.data.data) {
              const data = response.data.data;

              // Autofill fields using setFieldValue
              setFieldValue("licenseNo", "");
              setFieldValue("EngShopName", data.SHOPNAME || "");
              setFieldValue("MarShopName", data.SHOPNAMEMAR || "");
              setFieldValue("PanCard", data.PANNO || "");
              setFieldValue("ContactNo", data.CONTACTNO || "");
              setFieldValue("Email", data.EMAIL || "");
              setFieldValue("ShopAddress", data.ADDRESS || "");
              setFieldValue("WardNo", data.WARDID || "");
              setFieldValue("ZoneNo", data.ZONEID || "");
              setFieldValue("ArrearsAmount", data.ARREARSAMT || 0);

              // Date fields need special handling to convert ISO string to Date object
              if (data.FROMDT) {
                const fromDateObj = new Date(data.FROMDT);
                setFromDate(fromDateObj);
                setFieldValue("fromDate", fromDateObj);
              }
              if (data.TODT) {
                const toDateObj = new Date(data.TODT);
                setToDate(toDateObj);
                setFieldValue("toDate", toDateObj);
              }

              setFieldValue("amount", data.AMOUNT || 0);

              // Conditional mapping for radio buttons
              setFieldValue(
                "isItemManufactured",
                data.ISPROD === "Y" ? "yes" : data.ISPROD === "N" ? "no" : ""
              );
              setFieldValue(
                "isOwnBrandBusinessNo",
                data.OWNSPACE === "Y"
                  ? "yes"
                  : data.OWNSPACE === "N"
                  ? "no"
                  : ""
              );
              setFieldValue("OwnerName", data.PLACEOWNERNAME || "");
              setFieldValue("OwnerAddress", data.PLACEOWNERADDRESS || "");
              setFieldValue("AggrementType", data.AGRMENTWITH || "");
              setFieldValue("UsedArea", data.AREA || "");
              setFieldValue("YearOfCommencement", data.BUSSTARTYR || "");
              setFieldValue("FormNo", data.SHOPACTNO || "");
              setFieldValue(
                "NoObjectionCertificate",
                data.ISCORPNOC === "Y"
                  ? "yes"
                  : data.ISCORPNOC === "N"
                  ? "no"
                  : ""
              );
              setFieldValue("NondaniFormNo", data.FOODLICNO || "");

              // Autofill TradeCategory and TradeType if present in application data
              if (data.TRADECATEGORYID) {
                setFieldValue("TradeCategory", data.TRADECATEGORYID);
              }
              if (data.TRADETYPEID) {
                setFieldValue("TradeType", data.TRADETYPEID);
              }
              // Populate left table data from application info if available
              if (data.TRADE_DETAILS && Array.isArray(data.TRADE_DETAILS)) {
                const newLeftTableData = data.TRADE_DETAILS.map((detail) => ({
                  TRADECATEGORYID: detail.TRADECATEGORYID,
                  TRADETYPEID: detail.TRADETYPEID,
                  TRADERATE: detail.TRADERATE,
                  tradeType: detail.TRADETYPENAME || "Unknown",
                  rate: detail.TRADERATE,
                }));
                setLeftTableData(newLeftTableData);
              }
            } else {
              console.warn(
                "No 'data' found in detailed application info response."
              );
            }
          } catch (error) {
            console.error("Error fetching detailed application info:", error);
          }
          finally {
      setLoading(false); // 🔹 stop loader (always runs)
    }
        } else {
          console.log(
            "Application ID or ULB ID not available to fetch detailed application info."
          );
        }
      };

      fetchApplicationDetails();
    }, [applicationId, ulbId, setFieldValue]);

    // --- Effect to fetch Trade Types based on selected Trade Category ---
    useEffect(() => {
      const fetchTradeTypes = async () => {
        if (values.TradeCategory && ulbId) {
          try {
            console.log(
              `Fetching Trade Types for Category ID: ${values.TradeCategory}, ULB ID: ${ulbId}`
            );
            const response = await apiService.post(`getTradeTypesByCategory`, {
              tradeCategoryId: values.TradeCategory,
              ulbId: ulbId,
            });
            console.log("Trade Types by Category API Response:", response.data);
            if (response.data && response.data.data) {
              const options = response.data.data.map((item) => ({
                value: item.TRADETYPEID,
                label: item.NUM_RATE_TRADETYPENAME,
              }));
              setTradeTypeOptions(options);
            } else {
              setTradeTypeOptions([]);
              console.warn(
                "No 'data' found in getTradeTypesByCategory response."
              );
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

    // --- New useEffect to fetch specific trade rate ---
    useEffect(() => {
      const fetchSpecificTradeRate = async () => {
        if (values.TradeCategory && values.TradeType && ulbId) {
          try {
            const response = await apiService.post(`getSpecificTradeRate`, {
              ulbId: ulbId,
              tradeTypeId: values.TradeType,
              tradeCategoryId: values.TradeCategory,
            });
            console.log("Specific Trade Rate API Response:", response.data);
            if (
              response.data &&
              response.data.data &&
              response.data.data.TRADERATE !== undefined
            ) {
              setFieldValue("Rate", response.data.data.TRADERATE);
            } else {
              setFieldValue("Rate", "");
              console.warn(
                "No TRADERATE found in specific trade rate response."
              );
            }
          } catch (error) {
            console.error("Error fetching specific trade rate:", error);
            setFieldValue("Rate", "");
          }
        } else {
          setFieldValue("Rate", "");
        }
      };

      fetchSpecificTradeRate();
    }, [values.TradeCategory, values.TradeType, ulbId, setFieldValue]);

    // --- Effect to fetch trade types for the right-hand table with flags ---
    useEffect(() => {
      const fetchTradeTypesAndSelectedTradeIds = async () => {
        try {
          if (!ulbId || !applicationId) return;

          // Fetch trade IDs associated with current application
          const appTradeResponse = await apiService.post(
            `getApplicationTradeDetailsByAppId`,
            { applicationId: applicationId }
          );

          const matchedTradeIds =
            appTradeResponse?.data?.data?.map(
              (item) => item.NUM_APPLITRADE_TRADEID
            ) || [];

          const autoSelectedMap = {};
          matchedTradeIds.forEach((id) => {
            autoSelectedMap[id] = true;
          });
          setAutoSelectedTradeIds(autoSelectedMap);

          // Fetch all trade types with flag
          const tradeTypeResponse = await apiService.post(
            `getTradeTypesWithFlag`,
            { ulbId: ulbId }
          );

          const formattedData = [];
          const initialSelections = {};

          if (
            tradeTypeResponse?.data?.data &&
            Array.isArray(tradeTypeResponse.data.data)
          ) {
            tradeTypeResponse.data.data.forEach((item) => {
              // Mark selected if TRADEID is in matched list
              if (matchedTradeIds.includes(item.TRADEID)) {
                initialSelections[item.TRADEID] = true;
              } else if (item.FLAG === "Y") {
                initialSelections[item.TRADEID] = true;
              }

              formattedData.push({
                TRADEID: item.TRADEID,
                TRADENAME: item.TRADENAME,
                FLAG: item.FLAG,
              });
            });

            setTradeTypesWithFlagData(formattedData);
            setSelectedTradeTypes(initialSelections);
            setSelectedCheckboxData(initialSelections);
          } else {
            console.warn("No valid trade type data received.");
          }
        } catch (error) {
          console.error(
            "Error fetching trade types and matching selected ones:",
            error
          );
        }
      };

      fetchTradeTypesAndSelectedTradeIds();
    }, [ulbId, applicationId, setSelectedCheckboxData]);

    // --- Handler for removing a row from the left table ---
    const handleRemoveRow = (indexToRemove) => {
      const updatedData = [...leftTableData];
      updatedData.splice(indexToRemove, 1);
      setLeftTableData(updatedData);
    };

    // --- Handler for checkbox change in the right table ---
    const handleCheckboxChange = (tradeId) => {
      setSelectedTradeTypes((prevSelections) => {
        const newSelections = {
          ...prevSelections,
          [tradeId]: !prevSelections[tradeId],
        };
        setSelectedCheckboxData(newSelections);
        return newSelections;
      });
    };

    // --- Prepare data for the right table ---
    const rightTableData = tradeTypesWithFlagData.map((item) => {
      const isChecked = selectedTradeTypes[item.TRADEID] || false;
      const isDisabled = autoSelectedTradeIds[item.TRADEID] || false;

      return {
        option: (
          <input
            type="checkbox"
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => handleCheckboxChange(item.TRADEID)}
          />
        ),
        "व्यवसायाचे प्रकार": item.TRADENAME,
      };
    });

    // --- Effect to pass form data, trade data, and selected checkboxes to parent ---
    useEffect(() => {
      setFormData(values);
      setTradeData(leftTableData);
      setSelectedCheckboxData(selectedTradeTypes);
    }, [
      values,
      leftTableData,
      selectedTradeTypes,
      setFormData,
      setTradeData,
      setSelectedCheckboxData,
    ]);

    return (
      <Form>
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
              readOnly
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
              options={ZoneOptions}
              onChange={(e) => {
                setFieldValue("ZoneNo", e.target.value);
                setFieldValue("WardNo", "");
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
              options={WardOptions}
              disabled={!values.ZoneNo}
            />
            <ErrorMessage
              name="WardNo"
              component="div"
              className="text-danger"
            />
          </div>
        </div>

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
              options={tradeCategoryOptions}
              onChange={(e) => {
                setFieldValue("TradeCategory", e.target.value);
                setFieldValue("TradeType", "");
                setFieldValue("Rate", "");
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
              options={tradeTypeOptions}
              disabled={!values.TradeCategory}
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
          <div className="col-md-4">
            <Label text={`${translate("Rate")} :`} required />
            <Field
              name="Rate"
              component={InputField}
              type="number"
              placeholder={translate("रक्कम")}
              readOnly
            />
            <ErrorMessage name="Rate" component="div" className="text-danger" />
          </div>
          <div className="col-md-4">
            <SaveButton
              type="button"
              text={translate("Add To List")}
              onClick={() => {
                const tradeCategoryId = values.TradeCategory;
                const tradeTypeId = values.TradeType;
                const rate = values.Rate;

                if (!tradeCategoryId || !tradeTypeId || !rate) {
                  alert("Please select Trade Category, Trade Type and Rate.");
                  return;
                }

                const selectedTradeType = tradeTypeOptions.find(
                  (option) => String(option.value) === String(tradeTypeId)
                );

                const tradeTypeLabel = selectedTradeType?.label || "Unknown";

                const newItem = {
                  TRADECATEGORYID: tradeCategoryId,
                  TRADETYPEID: tradeTypeId,
                  TRADERATE: rate,
                  tradeType: tradeTypeLabel,
                  rate,
                };

                setLeftTableData((prev) => [...prev, newItem]);
                console.log("Added new item to left table:", newItem);

                setFieldValue("TradeCategory", "");
                setFieldValue("TradeType", "");
                setFieldValue("Rate", "");
              }}
            />
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
                    keyMapping={{
                      [translate("काढा")]: "remove",
                      [translate("व्यवसायाचे स्वरूप")]: "tradeType",
                      [translate("दर")]: "rate",
                    }}
                    data={leftTableData}
                    customRenderers={{
                      [translate("काढा")]: (row, index) => (
                        <span
                          style={{
                            cursor: "pointer",
                            color: "blue",
                            fontSize: "15px",
                          }}
                          onClick={() => handleRemoveRow(index)}
                        >
                          {translate("Remove")}
                        </span>
                      ),
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
                    keyMapping={{
                      [translate("निवडा")]: "option",
                      [translate("व्यवसायाचे प्रकार")]: "व्यवसायाचे प्रकार",
                    }}
                    data={rightTableData}
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
                  id="isOwnBrandBusinessYes"
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
              name="isOwnBrandBusinessNo"
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
            <Label text={`${translate("शॉप ऍक्ट नोंदणी क्र.")} :`} required />
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
                  id="NoObjectionCertificateYes"
                />
                <Field
                  name="NoObjectionCertificate"
                  component={RadioButton}
                  label={translate("नाही")}
                  value="no"
                  id="NoObjectionCertificateNo"
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
        <hr />
      </Form>
    );
  }
);

const SanchalakMahitiTab = forwardRef(({ setDirectorData, onSubmit }, ref) => {
  useImperativeHandle(ref, () => ({
    triggerFinalSubmit: async () => {
      try {
        if (onSubmit) {
          await onSubmit();
          console.log("Verification completed.");
        }
      } catch (err) {
        console.error("Error during final submit:", err);
        alert(translate("अर्ज सबमिट करताना त्रुटी आली."));
      }
    },

    getDirectorList: () => directorList,
  }));

  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;
  const params = new URLSearchParams(location.search);
  const applicationId = params.get("applicationId");
  const validationSchema = ValidationSchemas(translate).FrmAppliVerificationMst;

  const [applicationTypes, setApplicationTypes] = useState([]);
  const [directorList, setDirectorList] = useState([]);

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
        } else {
          console.warn("No application type data received.");
        }
      } catch (error) {
        console.error("Error fetching application types:", error);
      }
    };

    if (UlbId) {
      fetchApplicationTypes();
    }
  }, [UlbId]);

  useEffect(() => {
    const fetchDirectorDetails = async () => {
      if (!applicationId) {
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

          const maxExistingId = response.data.data.reduce((maxId, director) => {
            const idAsNumber = parseInt(director.DIRECTORID, 10);
            return !isNaN(idAsNumber) ? Math.max(maxId, idAsNumber) : maxId;
          }, 0);

          // setNextTempDirectorId(maxExistingId + 1);
        } else {
          setDirectorList([]);
          console.warn(
            "No director details data received or invalid format.",
            response.data
          );
        }
      } catch (error) {
        console.error("Error fetching director details:", error);
        setDirectorList([]);
      }
    };

    fetchDirectorDetails();
  }, [applicationId]);

  const initialValues = {
    AAdharNo: "",
    SanchalakName: "",
    LicenseNo: "",
    ContactNo: "",
    Email: "",
    Gender: "",
    Address: "",
    ApplicantType: "",
    directorPhoto: null,
  };

  const handleAddDirector = async (values) => {
    const requiredFields = [
      "AAdharNo",
      "SanchalakName",
      "LicenseNo",
      "ContactNo",
      "Email",
      "Gender",
      "Address",
      "ApplicantType",
    ];

    const allFieldsFilled = requiredFields.every((field) => {
      const value = values[field];
      return (
        value !== null && value !== undefined && String(value).trim() !== ""
      );
    });

    const selectedApplicantType = applicationTypes.find(
      (type) => type.value === values.ApplicantType
    );
    const applicantTypeName = selectedApplicantType
      ? selectedApplicantType.label
      : "";

    // Use the temp ID for this director
    const tempId = 1;

    const newDirector = {
      DIRECTORID: tempId,
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

    setDirectorList((prevList) => [...prevList, newDirector]);

    if (values.directorPhoto && applicationId) {
      try {
        const formData = new FormData();
        formData.append("directorid", tempId);
        formData.append("appid", applicationId);
        formData.append("imagedata", values.directorPhoto);

        const uploadResponse = await apiService.post(
          `updateDirectorPhoto`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (!uploadResponse.data.success) {
          alert(`Failed to upload photo: ${uploadResponse.data.message}`);
        }
      } catch (error) {
        alert(`Error uploading photo: ${error.message}`);
      }
    }
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleAddDirector}
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
                    label={translate("ईतर")}
                    value="O"
                    id="genderOther"
                    checked={values.Gender === "O"}
                  />
                  <ErrorMessage
                    name="Gender"
                    component="div"
                    className="text-danger mt-1"
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
              <FileUpload name="directorPhoto" setFieldValue={setFieldValue} />
            </div>
          </div>
          <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
            <SaveButton type="submit" text={translate("Add Director")} />
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
                  translate("ईमेल"),
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
                  [translate("ईमेल")]: director.EMAIL,
                  [translate("लिंग")]:
                    director.GENDER === "M"
                      ? translate("पुरुष")
                      : director.GENDER === "F"
                      ? translate("स्त्री")
                      : translate("ईतर"),
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
                            : director.directorImage
                            ? `${BASE_API_URL}${director.directorImage}`
                            : "" 
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
                      onClick={() => {
                        setDirectorList((prevList) =>
                          prevList.filter(
                            (d) => d.DIRECTORID !== director.DIRECTORID
                          )
                        );
                      }}
                    />
                  ),
                  DIRECTORID: director.DIRECTORID,
                }))}
                keyMapping={{
                  [translate("आधार क्र.")]: translate("आधार क्र."),
                  [translate("संचालकांचे नांव")]: translate("संचालकांचे नांव"),
                  [translate("Voter ID Card No / License No")]: translate(
                    "Voter ID Card No / License No"
                  ),
                  [translate("मोबाईल क्र.")]: translate("मोबाईल क्र."),
                  [translate("ईमेल")]: translate("ईमेल"),
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
});

const BASE_API_URL = "http://localhost:5000";
const KagadpatraJodaneTab = forwardRef(({ applicationId, onSubmit }, ref) => {
  useImperativeHandle(ref, () => ({
    triggerFinalSubmit: () => {
      if (onSubmit) onSubmit();
    },
    getDocumentList: () => [...documents],
  }));

  const { translate } = useLanguage();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      setDocuments([]);

      if (!applicationId) {
        console.warn("⚠️ No applicationId provided — skipping fetch.");
        setLoading(false);
        return;
      }

      try {
        const response = await apiService.post("FrmAppliVerificationMst", {
          applicationId,
        });

        const data = response.data;

        if (data && Array.isArray(data.data)) {
          const relevantDocuments = data.data.filter(
            (doc) => String(doc.APPLIID) === String(applicationId)
          );
          const initializedDocuments = relevantDocuments.map((doc) => ({
            ...doc,
            remarks: doc.REMARKS || "",
            checked: false,
          }));
          setDocuments(initializedDocuments);
        } else {
          console.warn("⚠️ Unexpected API response format:", data);
          setDocuments([]);
        }
      } catch (e) {
        console.error("❌ Error fetching documents:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [applicationId]);

  const handleInputChange = (documentId, fieldName, value) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) =>
        doc.PRIMARYDOCID === documentId ? { ...doc, [fieldName]: value } : doc
      )
    );
  };

  const handleDownload = async (doc) => {
    if (!doc.fileUrl) return alert("File URL missing");

    try {
      const response = await fetch(`${BASE_API_URL}${doc.fileUrl}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const fileName = `${doc.DOCTYPENAME || "document"}${doc.FILETYPE || ""}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Download failed:", err);
      alert("Failed to download file. Please try again.");
    }
  };

  if (loading) return <div>{translate("Loading documents...")}</div>;
  if (error)
    return (
      <div style={{ color: "red" }}>
        {translate("Error")}: {error}
      </div>
    );

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
        href={`${BASE_API_URL}${doc.fileUrl}`}
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
  }));

  const keyMapping = {
    [translate("दस्ताऐवजाचे नाव")]: translate("दस्ताऐवजाचे नाव"),
    [translate("शेरा")]: translate("शेरा"),
    [translate("View")]: "View",
    [translate("Download")]: "Download",
  };

  return (
    <div className="kagadpatra-jodane-tab">
      <Table
        headers={tableHeaders}
        data={tableData}
        keyMapping={keyMapping}
        onInputChange={handleInputChange}
        checkboxIdentifier="PRIMARYDOCID"
        showCheckboxInHeader={false}
        customRenderers={{
          [translate("शेरा")]: (row, rowIndex, updateRow) => (
            <InputField
              field={{ name: "remarks", value: row.remarks || "" }}
              form={{
                setFieldValue: (name, value) => {
                  const updatedRow = { ...row, [name]: value };
                  updateRow(rowIndex, updatedRow);
                },
              }}
            />
          ),
        }}
        noDataMessage={translate("No documents found for this application.")}
      />
    </div>
  );
});

function FrmAppliVerificationMst() {
  const { translate } = useLanguage();
  const [prathmikData, setPrathmikData] = useState({});
  const [directorData, setDirectorData] = useState([]);
  const navigate = useNavigate();
  const ipAddress = useIP();
  const [documents, setDocuments] = useState([]);
  const [key, setKey] = useState("prathmikMahiti");
  const [applicationId, setApplicationId] = useState(null);
  const [tradeData, setTradeData] = useState([]);
  const [selectedCheckboxData, setSelectedCheckboxData] = useState({});
  const validationSchema = ValidationSchemas(translate).FrmAppliVerificationMst;
  const { user } = useAuth();
  const UlbId = user?.ulbId;
  const userId = user?.userId;
  const initialApplicationNo = localStorage.getItem("applicationNo");

  // Use useState to hold the application number, initialized with the retrieved value
  const [applicationNo, setApplicationNo] = useState(initialApplicationNo);

  console.log("Retrieved Application Number directly:", applicationNo);
  const prathmikRef = useRef();
  const sanchalakRef = useRef();
  const kagadpatraRef = useRef();

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("applicationId");
    if (id) {
      setApplicationId(id);
    }
  }, []);

  const handleFinalSubmit = async (latestDirectors = directorList) => {
    debugger;
    const currentDirectorList = latestDirectors || directorData;

    if (!currentDirectorList || currentDirectorList.length === 0) {
      alert("|| Please Add At least One Director ||");
      setKey("sanchalakMahiti");
      return;
    }

    // Prepare trade string
    const In_Applitrade_Str = Object.entries(selectedCheckboxData)
      .filter(([_, isChecked]) => isChecked)
      .map(([tradeId]) => `${tradeId}$`)
      .join("#");

    const In_Applitradetype_Str = tradeData
      .map((item) => `${item.TRADETYPEID}$${item.TRADERATE}`)
      .join("#");

    const In_Applidirector_Str = currentDirectorList
      .map(
        (d) =>
          `${d.DIRECTORID}$${d.DIRCTORNAME}$${d.VOTERID || ""}$${
            d.ADDRESS || ""
          }$${d.MOBILENO || ""}$${d.EMAIL || ""}$${d.GENDER || ""}$${
            d.APPLITYPEID || ""
          }$${d.ADHARNO || ""}`
      )
      .join("#");

    // Helper to fetch existing image as File
    const fetchImageAsBlob = async (url) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], "photo.jpg", { type: blob.type });
    };

    // Upload director photos
    const uploadAllDirectorPhotos = async () => {
      for (const director of currentDirectorList) {
        let imageFile = null;

        if (director._photoFile && director._photoFile instanceof File) {
          imageFile = director._photoFile; // New uploaded photo
        } else if (
          director.directorImage &&
          !director.directorImage.startsWith("blob:")
        ) {
          try {
            imageFile = await fetchImageAsBlob(director.directorImage); // Existing photo from server
            director._photoFile = imageFile;
            director.directorImage = URL.createObjectURL(imageFile); // preview
          } catch (err) {
            console.warn(
              `Failed to fetch image for ${director.DIRCTORNAME}`,
              err
            );
            continue;
          }
        }

        if (imageFile && applicationId) {
          const formData = new FormData();
          formData.append("directorid", director.DIRECTORID);
          formData.append("appid", applicationId);
          formData.append("imagedata", imageFile);

          try {
            const res = await apiService.post("updateDirectorPhoto", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            if (!res.data.success) {
              console.warn(
                `Upload failed for ${director.DIRCTORNAME}:`,
                res.data.message
              );
            }
          } catch (uploadErr) {
            console.error(
              `Upload error for ${director.DIRCTORNAME}:`,
              uploadErr
            );
          }
        }
      }
    };

    // Build API payload
    const body = {
      In_UserId: userId,
      In_Appid: applicationId,
      In_AppliNo: applicationNo,
      In_OldLicencNo: null,
      In_ShopName: prathmikData.EngShopName,
      In_PANNo: prathmikData.PanCard || null,
      In_ContactNo: prathmikData.ContactNo || null,
      In_Email: prathmikData.Email || null,
      In_Address: prathmikData.ShopAddress || "",
      In_ZoneId: parseInt(prathmikData.ZoneNo) || 0,
      In_WardId: parseInt(prathmikData.WardNo) || 0,
      In_IsProd: prathmikData.isItemManufactured === "yes" ? "Y" : "N",
      In_OwnSpace: prathmikData.isOwnBrandBusinessNo === "yes" ? "Y" : "N",
      In_Agrmentwith: prathmikData.AggrementType || "",
      In_Area: parseFloat(prathmikData.UsedArea) || 0,
      In_IsCorpNOC: prathmikData.NoObjectionCertificate === "yes" ? "Y" : "N",
      In_BusStartYr: parseInt(prathmikData.YearOfCommencement) || 0,
      In_ShopActNo: prathmikData.FormNo || "",
      In_foodlicno: prathmikData.NondaniFormNo || "",
      In_LicDays: null,
      In_Applitrade_Str,
      In_Applitradetype_Str,
      In_Applidirector_Str,
      In_Source: "DEPT",
      In_ShopNameMar: prathmikData.MarShopName || "",
      In_PlaceOwnerName: prathmikData.OwnerName || "",
      In_PlaceOwnerAddress: prathmikData.OwnerAddress || "",
      In_FromDate: formatDate(prathmikData.fromDate),
      In_ToDate: formatDate(prathmikData.toDate),
      in_amount: parseFloat(prathmikData.amount) || 0,
      In_OrgId: UlbId,
      In_ArrAmount: parseFloat(prathmikData.ArrearsAmount) || 0,
      in_ipaddr: ipAddress,
      In_siuser: 101,
      in_PropNo: prathmikData.PropNo || "",
      in_MarketPropNo: prathmikData.MarketPropNo || "",
    };

    try {
      const res = await apiService.post("aomk_AppliVerify_ins", body);

      // Upload all director photos after main submission
      await uploadAllDirectorPhotos();

      alert(
        `|| Application Verified Successfully, Application No:${applicationId} ||`
      );
      navigate("/Transaction/FrmAppliVerificationList.aspx");
    } catch (err) {
      console.error("Submit error:", err);
      if (err.response) {
        alert("Submission failed: " + JSON.stringify(err.response.data));
      } else if (err.request) {
        alert("No response from server.");
      } else {
        alert("Error: " + err.message);
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
          text={translate("अर्ज पडताळणी मास्टर")}
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
            <Tab.Pane eventKey="prathmikMahiti">
              <Formik
                enableReinitialize={true}
                initialValues={{
                  TradeCategory: "",
                  TradeType: "",
                  licenseNo: "",
                  EngShopName: "",
                  MarShopName: "",
                  PanCard: "",
                  ContactNo: "",
                  Email: "",
                  ShopAddress: "",
                  WardNo: "",
                  ZoneNo: "",
                  ArrearsAmount: "",
                  fromDate: null,
                  toDate: null,
                  amount: "",
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
                }}
                validationSchema={validationSchema}
              >
                <PrathmikMahitiTab
                  ref={prathmikRef}
                  applicationId={applicationId}
                  setFormData={setPrathmikData}
                  setTradeData={setTradeData}
                  setSelectedCheckboxData={setSelectedCheckboxData}
                  onSubmit={handleFinalSubmit}
                />
              </Formik>
            </Tab.Pane>
            <Tab.Pane eventKey="sanchalakMahiti">
              <SanchalakMahitiTab
                ref={sanchalakRef}
                applicationId={applicationId}
                setDirectorData={setDirectorData}
                onSubmit={handleFinalSubmit}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="kagadpatraJodane">
              <KagadpatraJodaneTab
                ref={kagadpatraRef}
                applicationId={applicationId}
                setDocuments={setDocuments}
                onSubmit={handleFinalSubmit}
              />
            </Tab.Pane>
          </Tab.Content>
          <div className="d-flex justify-content-center flex-direction-row gap-4 mt-4">
            <SaveButton
              text={translate("अर्ज जतन करा ")}
              onClick={async () => {
                if (sanchalakRef?.current?.getDirectorList) {
                  const latestDirectors =
                    sanchalakRef.current.getDirectorList();
                  setDirectorData(latestDirectors); //
                  await handleFinalSubmit(latestDirectors);
                }
              }}
            />

            <SaveButton
              type="button"
              text={translate("बंद")}
              onClick={() => {
                navigate("/HomePage/Dashboard.aspx");
              }}
            />
          </div>
        </Tab.Container>
      </Container>
    </div>
  );
}

export default FrmAppliVerificationMst;
