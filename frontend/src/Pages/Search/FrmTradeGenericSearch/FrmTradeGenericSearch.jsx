import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import Table from "../../../Components/Table/Table"; // Import Table component
import { useAuth } from "../../../Context/AuthContext";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmTradeGenericSearch() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const navigate = useNavigate();

  const [zoneOptions, setZoneOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [tableData, setTableData] = useState([]);
  // New state to explicitly track the selected zone ID for ward fetching
  const [selectedZoneId, setSelectedZoneId] = useState("");

  const formikRef = useRef(null); // Keeping ref for other Formik manipulations if needed

  const initialValues = {
    shopName: "",
    aadhaarNo: "",
    panCardNo: "",
    contactNo: "",
    email: "",
    address: "",
    zoneNo: "", // This will still hold the selected zone ID within Formik
    wardNo: "", // This will still hold the selected ward ID within Formik
    bondPasteRegNo: "",
    fdaRegNo: "",
    isItemManufactured: "yes",
    isOwnBrandBusiness: "yes",
    licenseNo: "",
    directorName: "",
    directorContactNo: "",
    directorEmail: "",
  };

  // --- Fetch Zone Data ---
  useEffect(() => {
    const fetchZoneData = async () => {
      if (!ulbId) {
        console.log("UlbId not available, skipping zone data fetch.");
        return;
      }

      try {
        const zoneResponse = await axios.post(`${API_BASE_URL}/get-zones`, {
          ulbid: ulbId,
        });

        if (zoneResponse.data && Array.isArray(zoneResponse.data)) {
          const zoneData = zoneResponse.data.map((z) => ({
            label: z.ZONENAME,
            value: String(z.ZONEID),
          }));
          setZoneOptions(zoneData);

          // If only one zone, pre-select it in Formik and update selectedZoneId
          if (zoneData.length === 1) {
            const singleZoneValue = zoneData[0].value;
            if (formikRef.current) {
              formikRef.current.setFieldValue("zoneNo", singleZoneValue);
            }
            setSelectedZoneId(singleZoneValue); // Set the state to trigger ward fetch
          }
        } else {
          alert("No zone data found.");
          setZoneOptions([]);
        }
      } catch (err) {
        console.error("Error fetching zone data:", err);
        alert("Failed to load zone data.");
        setZoneOptions([]);
      }
    };

    fetchZoneData();
  }, [ulbId]); // Dependency: ulbId

  // --- Fetch Ward Data based on selectedZoneId ---
  useEffect(() => {
    const fetchWardsByZone = async () => {
      if (!selectedZoneId || !ulbId) {
        // Clear ward options and Formik field if no zone or UlbId
        if (formikRef.current) {
          formikRef.current.setFieldValue("wardNo", "");
        }
        setWardOptions([]);
        return;
      }

      try {
        const wardResponse = await axios.post(`${API_BASE_URL}/get-wards`, {
          zoneid: selectedZoneId,
          ulbid: ulbId,
        });

        const result = wardResponse.data;

        if (result && Array.isArray(result)) {
          const wardData = result.map((w) => ({
            label: w.WARDNAME,
            value: String(w.WARDID),
          }));
          setWardOptions(wardData);
        } else {
          setWardOptions([]); // Clear if no wards found for the selected zone
          if (formikRef.current) {
            formikRef.current.setFieldValue("wardNo", ""); // Also clear the Formik field
          }
        }
      } catch (err) {
        console.error("Error fetching ward data:", err);
        alert("Failed to load ward data.");
        setWardOptions([]);
        if (formikRef.current) {
          formikRef.current.setFieldValue("wardNo", ""); // Clear on error
        }
      }
    };

    fetchWardsByZone();
  }, [selectedZoneId, ulbId]); // Dependency on selectedZoneId and ulbId

  const handleSearch = async (values) => {
    try {
      const requestBody = {
        OrgId: ulbId,
        ShopName: values.shopName,
        AadharNo: values.aadhaarNo,
        PanNo: values.panCardNo,
        MobileNo: values.contactNo,
        Email: values.email,
        Address: values.address,
        ZoneId: values.zoneNo,
        WardId: values.wardNo,
        ShopActNo: values.bondPasteRegNo,
        FoodLicNo: values.fdaRegNo,
        IsProd: values.isItemManufactured === "yes" ? "Y" : "N",
        OwnSpace: values.isOwnBrandBusiness === "yes" ? "Y" : "N",
        DirectorName: values.directorName,
        DirectorMob: values.directorContactNo,
        DirectorEmail: values.directorEmail,
        LicenseNo: values.licenseNo,
      };

      const response = await axios.post(
        `${API_BASE_URL}/FrmTradeGenericSearch`,
        requestBody
      );

      console.log("API Response:", response.data);

      if (response.data?.data?.length > 0) {
        setTableData(response.data.data);
      } else {
        setTableData([]);
        alert(translate("No records found."));
      }
    } catch (error) {
      console.error("Search error:", error);
      alert(translate("An error occurred while fetching data."));
      setTableData([]);
    }
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("व्यापार सामान्य शोध")}
        />
        <hr />
        <Formik
          initialValues={initialValues}
          onSubmit={handleSearch}
          innerRef={formikRef} // Keep ref for initial value setting if needed
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="row mb-3 mt-4">
                <div className="col-md-6">
                  <Label text={`${translate("दुकानाचे नाव")} :`} />
                  <Field name="shopName" component={InputField} />
                </div>
                <div className="col-md-6">
                  <Label text={`${translate("आधार क्र.")} :`} />
                  <Field name="aadhaarNo" component={InputField} type="tel" />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("पॅन कार्ड नं.")} :`} />
                  <Field name="panCardNo" component={InputField} />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("संपर्क क्र.")} :`} />
                  <Field name="contactNo" component={InputField} type="tel" />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("ई-मेल")} :`} />
                  <Field name="email" component={InputField} />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("पत्ता")} :`} />
                  <Field name="address" component={InputField} />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("झोन क्र.")} :`} />
                  <Field
                    name="zoneNo"
                    component={InputField}
                    type="dropdown"
                    className="form-control"
                    options={zoneOptions}
                    onChange={(e) => {
                      const newZoneValue = e.target.value;
                      setFieldValue("zoneNo", newZoneValue);
                      setSelectedZoneId(newZoneValue); // Update the state that drives ward fetching
                      setFieldValue("wardNo", ""); // Reset ward when zone changes
                      setWardOptions([]); // Clear ward options immediately
                    }}
                    value={values.zoneNo}
                  ></Field>
                  <ErrorMessage
                    name="zoneNo"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("वार्ड क्र.")} :`} />
                  <Field
                    name="wardNo"
                    component={InputField}
                    type="dropdown"
                    className="form-control"
                    disabled={!values.zoneNo} // Disable if no zone is selected
                    onChange={(e) => setFieldValue("wardNo", e.target.value)}
                    value={values.wardNo}
                    options={wardOptions}
                  ></Field>
                  <ErrorMessage
                    name="wardNo"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("शॉप ऍक्ट नोंदणी क्र.")} :`} />
                  <Field name="bondPasteRegNo" component={InputField} />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("अन्न व ओषध नोंदणी क्र.")} :`} />
                  <Field name="fdaRegNo" component={InputField} />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("परवाना क्रमांक")} :`} />
                  <Field name="licenseNo" component={InputField} />
                </div>
              </div>

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
                        onChange={() =>
                          setFieldValue("isItemManufactured", "yes")
                        }
                        checked={values.isItemManufactured === "yes"}
                      />
                      <Field
                        name="isItemManufactured"
                        component={RadioButton}
                        label={translate("नाही")}
                        value="no"
                        id="isItemManufacturedNo"
                        onChange={() =>
                          setFieldValue("isItemManufactured", "no")
                        }
                        checked={values.isItemManufactured === "no"}
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
                          " स्वते चे: मालकीचे जागेत व्यवसाय करीत आहे का"
                        )} :`}
                      />
                    </div>
                    <div className="d-flex gap-3 mt-1">
                      <Field
                        name="isOwnBrandBusiness"
                        component={RadioButton}
                        label={translate("होय")}
                        value="yes"
                        id="isOwnBrandBusinessYes"
                        onChange={() =>
                          setFieldValue("isOwnBrandBusiness", "yes")
                        }
                        checked={values.isOwnBrandBusiness === "yes"}
                      />
                      <Field
                        name="isOwnBrandBusiness"
                        component={RadioButton}
                        label={translate("नाही")}
                        value="no"
                        id="isOwnBrandBusinessNo"
                        onChange={() =>
                          setFieldValue("isOwnBrandBusiness", "no")
                        }
                        checked={values.isOwnBrandBusiness === "no"}
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
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("संचालकांचा नाव")} :`} />
                  <Field name="directorName" component={InputField} />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("संपर्क क्र.")} :`} />
                  <Field name="directorContactNo" component={InputField} />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("ई-मेल")} :`} />
                  <Field name="directorEmail" component={InputField} />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton type="submit" text={translate("शोधा")} />
                <SaveButton
                  type="button"
                  text={translate("बंद")}
                  onClick={() => navigate("/HomePage/Dashboard.aspx")}
                />
              </div>
            </Form>
          )}
        </Formik>
        {Array.isArray(tableData) && tableData.length > 0 && (
          <div className="certi_change_table mt-5">
            <Table
              headers={[
                translate("दुकानाचे नाव"),
                translate("पॅन कार्ड नं."),
                translate("संपर्क क्र."),
                translate("ई-मेल"),
                translate("पत्ता"),
                translate("झोन क्र."),
                translate("वार्ड क्र."),
                translate("दुकानाचे खाते क्र."),
                translate("खादय परवाना"),
                translate("संचालकांचे आधार क्रमांक"),
                translate("संचालकांचे नाव"),
                translate("संचालकांचे ई-मेल"),
                translate("संचालकांचे मोबाईल क्र"),
              ]}
              data={tableData.map((row) => ({
                SHOP_NAME: row.SHOP_NAME,
                PAN_NO: row.PAN_NO,
                MOB_NO: row.MOB_NO,
                EMAIL: row.EMAIL || "",
                MKT_ADDRESS: row.MKT_ADDRESS,
                ZONE_NAME: row.ZONE_NAME,
                WARD_NAME: row.WARD_NAME,
                SHOP_ACTNO: row.SHOP_ACTNO,
                FOOD_LICNO: row.FOOD_LICNO,
                ADHAR_NO: row.ADHAR_NO,
                DIRECTOR_NAME: row.DIRECTOR_NAME,
                DIRECTOR_EMAIL: row.DIRECTOR_EMAIL || "",
                DIRECTOR_MOB: row.DIRECTOR_MOB,
              }))}
              keyMapping={{
                [translate("दुकानाचे नाव")]: "SHOP_NAME",
                [translate("पॅन कार्ड नं.")]: "PAN_NO",
                [translate("संपर्क क्र.")]: "MOB_NO",
                [translate("ई-मेल")]: "EMAIL",
                [translate("पत्ता")]: "MKT_ADDRESS",
                [translate("झोन क्र.")]: "ZONE_NAME",
                [translate("वार्ड क्र.")]: "WARD_NAME",
                [translate("दुकानाचे खाते क्र.")]: "SHOP_ACTNO",
                [translate("खादय परवाना")]: "FOOD_LICNO",
                [translate("संचालकांचे आधार क्रमांक")]: "ADHAR_NO",
                [translate("संचालकांचे नाव")]: "DIRECTOR_NAME",
                [translate("संचालकांचे ई-मेल")]: "DIRECTOR_EMAIL",
                [translate("संचालकांचे मोबाईल क्र")]: "DIRECTOR_MOB",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmTradeGenericSearch;
