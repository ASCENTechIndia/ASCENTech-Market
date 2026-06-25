import React, { useEffect, useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import TextArea from "../../../Components/TextArea/textarea";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useAuth } from "../../../Context/AuthContext";
import useIP from "../../../Hooks/UseIp";
import config from "../../../utils/config";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../../../../apiService";

function FrmUlbTipMst() {
  const { translate } = useLanguage();
  const [searchParams] = useSearchParams();
  const ipAddress = useIP();
  const { user } = useAuth();
  const userId = user?.userId || "P"; 
  const userUlbId = user?.ulbId || 10; 
  const navigate = useNavigate();

  const ulbTipId = searchParams.get("ulbTipId");
  const [corporationOptions, setCorporationOptions] = useState([]);
  const [initialValues, setInitialValues] = useState({
    corporationId: "",
    Slogan: "",
    Tip: "",

  });

 
  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        const response = await apiService.get(`CorporationDropdown`);
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((corp) => ({
            value: corp.CORPID,
            label: corp.CORPNAME,
          }));
          setCorporationOptions(options);
        } else {
          setCorporationOptions([]);
        }
      } catch (err) {
        console.error("Error fetching corporations:", err);
      }
    };
    fetchCorporations();
  }, []);

  useEffect(() => {
    const loadExistingTip = async () => {
      if (!ulbTipId) {
        setInitialValues((prev) => ({
          ...prev,
          corporationId: String(userUlbId),
        }));
        return;
      }

      try {
        const response = await apiService.post(`FrmUlbTipMst`, {
          UlbTipId: parseInt(ulbTipId, 10),
        });

        if (response.data && response.data.errorCode === 9999 && response.data.data) {
          const data = response.data.data;
          setInitialValues({
            corporationId: String(data.NUM_ULBTIP_ULBID),
            Slogan: data.VAR_ULBTIP_SLOGAN || "",
            Tip: data.VAR_ULBTIP_TIP || "",
            in_status: data.VAR_ULBTIP_ACTIVE || "Y",
          });
        } else {
          setInitialValues({
            corporationId: String(userUlbId),
            Slogan: "",
            Tip: "",
            in_status: "Y",
          });
        }
      } catch (err) {
        console.error("Error fetching ULB Tip details:", err);
      }
    };

    loadExistingTip();
  }, [ulbTipId, userUlbId]);

  
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    const mode = ulbTipId ? 2 : 1;
    const payload = {
      in_userid: userId,
      in_ulbid: parseInt(values.corporationId, 10),
      in_tip: values.Tip,
      in_slogan: values.Slogan,
   
      in_ipaddress: ipAddress ,
      in_source: config.source,
      in_mode: mode,
    };

    console.log("🚀 Sending payload:", payload);

    try {
      const response = await apiService.post(`aomk_ulbtip_ins`, payload);

      if (response.data && response.data.Out_Errorcode === 9999) {
        alert(translate(response.data.Out_Errormsg || "Record Saved Successfully"));
        resetForm();
        navigate("/Masters/FrmUlbTipList.aspx");
      } else {
        alert(
          translate(response.data.Out_Errormsg || "Failed to save ULB Tip. Please try again.")
        );
      }
    } catch (err) {
      console.error("Error saving ULB Tip:", err);
      alert(translate("An error occurred while saving. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const submitButtonText = ulbTipId ? translate("Update") : translate("Submit");

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel className="headerlabel mt-4" text={translate("ULB Tip Master")} />
        <hr />

        <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
          {({ isSubmitting }) => (
            <Form className="container mt-4">
          
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={translate("नगरपालिकेचे नाव")} required />
                </div>
                <div className="col-md-6">
                  <Field
                    name="corporationId"
                    component={InputField}
                    type="dropdown"
                    options={corporationOptions}
                  />
                  <ErrorMessage name="corporationId" component="div" className="text-danger" />
                </div>
              </div>

            
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={translate("Slogan")} required />
                </div>
                <div className="col-md-4">
                  <Field
                    name="Slogan"
                    component={TextArea}
                    placeholder={translate("Enter Slogan")}
                    className="form-control"
                  />
                  <ErrorMessage name="Slogan" component="div" className="text-danger" />
                </div>
              </div>

           
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={translate("Tip")} required />
                </div>
                <div className="col-md-4">
                  <Field
                    name="Tip"
                    component={TextArea}
                    placeholder={translate("Enter Tip")}
                    className="form-control"
                  />
                  <ErrorMessage name="Tip" component="div" className="text-danger" />
                </div>
              </div>

             
              {/* <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={translate("Status")} required />
                </div>
                <div className="col-md-6 d-flex gap-4">
                  <Field
                    name="in_status"
                    component={RadioButton}
                    value="Y"
                    label={translate("Active")}
                    id="status-active"
                  />
                  <Field
                    name="in_status"
                    component={RadioButton}
                    value="N"
                    label={translate("Inactive")}
                    id="status-inactive"
                  />
                </div>
              </div> */}

              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton type="submit" text={submitButtonText} disabled={isSubmitting} />
                <SaveButton
                  type="button"
                  text={translate("Back")}
                  onClick={() => navigate("/Masters/FrmUlbTipList.aspx")}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmUlbTipMst;
