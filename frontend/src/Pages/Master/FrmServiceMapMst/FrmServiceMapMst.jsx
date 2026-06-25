import React, { useState, useEffect } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
import useIP from "../../../Hooks/UseIp";
import apiService from "../../../../apiService";
import config from "../../../utils/config";
import { useNavigate, useSearchParams } from "react-router-dom";

function FrmServiceMapMst() {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId;
  const ulbId = user?.ulbId;
  const ipAddress = useIP();
  const [searchParams] = useSearchParams();
  const serviceMapId = searchParams.get("serviceMapId");

  const [corporationOptions, setCorporationOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [initialValues, setInitialValues] = useState({
    ULBName: ulbId,
    ServiceName: "",
    GLCode: "",
    AccountNo: "",
  });


  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        const response = await apiService.get("CorporationDropdown");
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((corp) => ({
            value: corp.CORPID,
            label: corp.CORPNAME,
          }));
          setCorporationOptions(options);
        } else setCorporationOptions([]);
      } catch (err) {
        console.error("Error fetching corporation dropdown:", err);
      }
    };
    fetchCorporations();
  }, []);


  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiService.get("getServices");
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((service) => ({
            value: service.SERVICEID,
            label: service.SERVICENAME,
          }));
          setServiceOptions(options);
        } else setServiceOptions([]);
      } catch (err) {
        console.error("Error fetching service dropdown:", err);
      }
    };
    fetchServices();
  }, []);


  useEffect(() => {
    const fetchServiceMapDetails = async () => {
      setLoading(true);
      if (serviceMapId) {
        try {
          const response = await apiService.post("FrmServiceMapMst", {
            SerAccMapId: parseInt(serviceMapId, 10),
          });

          if (
            response.data &&
            response.data.errorCode === 9999 &&
            response.data.data
          ) {
            const data = response.data.data;
            setInitialValues({
              ULBName: String(data.NUM_SERVICEACCMAP_ULBID),
              ServiceName: String(data.NUM_SERVICEACCMAPP_SERVID),
              GLCode: data.VAR_SERVICEACCMAP_GLCODE || "",
              AccountNo: data.VAR_SERVICEACCMAP_ACCNO || "",
            });
          } else {
            setInitialValues({
              ULBName: ulbId,
              ServiceName: "",
              GLCode: "",
              AccountNo: "",
            });
          }
        } catch (err) {
          console.error("Error fetching Service Map details:", err);
          setInitialValues({
            ULBName: ulbId,
            ServiceName: "",
            GLCode: "",
            AccountNo: "",
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Add mode
        setInitialValues({
          ULBName: ulbId,
          ServiceName: "",
          GLCode: "",
          AccountNo: "",
        });
        setLoading(false);
      }
    };

    fetchServiceMapDetails();
  }, [serviceMapId, ulbId]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    const mode = serviceMapId ? 2 : 1; 

    const payload = {
      in_UserId: userId,
      in_Ulbid: parseInt(values.ULBName, 10),
      in_Servid: parseInt(values.ServiceName, 10),
      in_GlCode: values.GLCode,
      in_AccNo: values.AccountNo,
      in_Mode: mode,
      in_ipaddress: ipAddress,
      in_source: config.source,
    };

    if (mode === 2) {
      payload.in_ServiceaccmapId = parseInt(serviceMapId, 10);
    }

    console.log("Submitting payload:", payload);

    try {
      const response = await apiService.post("aomk_serviceaccmap_ins", payload);

      console.log("API Response:", response.data);

      if (response.data && response.data.errorcode === 9999) {
        alert(response.data.errormsg);
        resetForm();
        navigate("/Masters/FrmServiceMapList.aspx");
      } else {
        alert(
          response.data?.errormsg ||
            "Failed to save Service Map. Please try again."
        );
      }
    } catch (err) {
      console.error("Error saving Service Map:", err);
      alert("An error occurred while saving Service Map. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitButtonText = serviceMapId
    ? translate("Update")
    : translate("Submit");

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("Service Account Map Master")}
        />
        <hr />
        {loading ? (
          <p>{translate("Loading data...")}</p>
        ) : (
          <Formik
            initialValues={initialValues}
            enableReinitialize={true}
            validate={(values) => {
              const errors = {};
              if (!values.GLCode) {
                errors.GLCode = translate("GL Code is required");
              } else if (values.GLCode.length < 3) {
                errors.GLCode = translate("GL Code Should Be of Min 3");
              }

              if (!values.AccountNo) {
                errors.AccountNo = translate("Account No is required");
              } else if (values.AccountNo.length < 8) {
                errors.AccountNo = translate("Account No Should Be of Min 8");
              }

              return errors;
            }}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="container mt-4">
                {/* ULB Dropdown */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("ULB Name")} :`} required />
                  </div>
                  <div className="col-md-6">
                    <Field
                      name="ULBName"
                      type="dropdown"
                      component={InputField}
                      options={corporationOptions}
                      disabled={true} // always readonly
                    />
                    <ErrorMessage
                      name="ULBName"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                {/* Service Dropdown */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("Service Name")} :`} required />
                  </div>
                  <div className="col-md-6">
                    <Field
                      name="ServiceName"
                      type="dropdown"
                      component={InputField}
                      options={serviceOptions}
                      disabled={!!serviceMapId} // disable in edit mode
                    />
                    <ErrorMessage
                      name="ServiceName"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                {/* GL Code */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("GL Code")} :`} required />
                  </div>
                  <div className="col-md-6">
                    <Field
                      name="GLCode"
                      component={InputField}
                      placeholder={translate("GL Code")}
                      className="form-control"
                    />
                    <ErrorMessage
                      name="GLCode"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                {/* Account No */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("Account No")} :`} required />
                  </div>
                  <div className="col-md-6">
                    <Field
                      name="AccountNo"
                      component={InputField}
                      placeholder={translate("Account No")}
                      className="form-control"
                    />
                    <ErrorMessage
                      name="AccountNo"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-4 mt-4">
                  <SaveButton
                    type="submit"
                    text={submitButtonText}
                    disabled={isSubmitting}
                  />
                  <SaveButton
                    type="button"
                    text={translate("Back")}
                    onClick={() => navigate("/Masters/FrmServiceMapList.aspx")}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}

export default FrmServiceMapMst;
