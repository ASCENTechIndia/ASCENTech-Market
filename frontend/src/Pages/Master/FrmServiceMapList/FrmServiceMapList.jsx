import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import { useAuth } from "../../../Context/AuthContext";
import apiService from "../../../../apiService";

function FrmServiceMapList() {
  const { translate } = useLanguage();
  const navigate = useNavigate();
    const {user}=useAuth();
  const ulbId=user?.ulbId;
  const [corporationOptions, setCorporationOptions] = useState([]);
  const [selectedCorporationId, setSelectedCorporationId] = useState(String(ulbId));
  const [serviceMapData, setServiceMapData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        const response = await apiService.get(`CorporationDropdown`);
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((corp) => ({
            value: String(corp.CORPID),
            label: corp.CORPNAME,
          }));
          setCorporationOptions(options);
        } else {
          setCorporationOptions([]);
          console.warn("Invalid corporation data:", response.data);
        }
      } catch (err) {
        console.error("Error fetching corporation dropdown:", err);
      }
    };
    fetchCorporations();
  }, []);

  useEffect(() => {
    const fetchServiceMapData = async () => {
      if (ulbId) {
        setLoadingData(true);
        try {
          const response = await apiService.post(
            `FrmServiceMapList`,
            { ulbid: ulbId }
          );
          if (response.data && Array.isArray(response.data.data)) {
            setServiceMapData(response.data.data);
          } else {
            setServiceMapData([]);
            console.warn("Invalid service map data:", response.data);
          }
        } catch (err) {
          console.error("Error fetching service map data:", err);
          setServiceMapData([]);
        } finally {
          setLoadingData(false);
        }
      } else {
        setServiceMapData([]);
      }
    };
    fetchServiceMapData();
  }, [ulbId]);

const filteredServiceMapData = useMemo(() => {
  if (!searchTerm) return serviceMapData;
  const lower = searchTerm.toLowerCase();
  return serviceMapData.filter(
    (item) =>
      item.VAR_SERV_NAME?.toLowerCase().includes(lower) ||
      item.VAR_SERVICEACCMAP_GLCODE?.toLowerCase().includes(lower) ||
      item.VAR_SERVICEACCMAP_ACCNO?.toLowerCase().includes(lower)
  );
}, [serviceMapData, searchTerm]);

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("Service Account Map List")}
        />
        <hr />

        <Formik
          initialValues={{ Name: String(ulbId), search: searchTerm }}
          enableReinitialize={true}
          // onSubmit={(values) => {
          //   console.log("Search initiated with:", values.search);
          // }}
        >
          {({ setFieldValue }) => (
            <Form className="container mt-4">
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("नगरपालिकेचे नाव ")} :`} required />
                </div>
                <div className="col-md-6">
                  <Field
                    name="Name"
                    component={InputField}
                    className="form-control"
                    type="dropdown" disabled={true}
                    placeholder={translate("Select option")}
                    options={corporationOptions}
                    onChange={(e) => {
                      const selected = e.target.value;
  setFieldValue("Name", selected);
  setSelectedCorporationId(selected);
  setSearchTerm("");
  setFieldValue("search", "");
                    }}
                  />
                </div>
              </div>

              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("search")} :`} required />
                </div>
                <div className="col-md-6">
                  <Field
                    name="search"
                    placeholder={translate(" Search here..")}
                    className="form-control"
                    component={InputField}
                    onChange={(e) => {
                      setFieldValue("search", e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                  />
                  <ErrorMessage
                    name="search"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-2 d-flex justify-content-end">
                  <SaveButton
                    text={translate("नवीन माहिती जोडा")}
                    to="/Masters/FrmServiceMapMst.aspx"
                  />
                </div>
              </div>
              <hr />
             {filteredServiceMapData.length === 0 ? (
  <p>No data found.</p>
) : (
  <Table
  headers={[
    translate("Select"),
    translate("Service Name"),
    translate("GL Code"),
    translate("Account No."),
  ]}
  data={filteredServiceMapData.map((item) => ({
    option: (
      <LinkButton
        to={`/Masters/FrmServiceMapMst.aspx?serviceMapId=${item.NUM_SERVICEACCMAP_ID}`}
        text={translate("Select")}
      />
    ),
    ServiceName: item.VAR_SERV_NAME,
    GLCode: item.VAR_SERVICEACCMAP_GLCODE,
    AccountNo: item.VAR_SERVICEACCMAP_ACCNO,
  }))}
  keyMapping={{
    [translate("Select")]: "option",
    [translate("Service Name")]: "ServiceName",
    [translate("GL Code")]: "GLCode",
    [translate("Account No.")]: "AccountNo",
  }}
/>

)}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmServiceMapList;
