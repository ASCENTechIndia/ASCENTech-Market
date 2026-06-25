import React, { useEffect, useState } from "react";

import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";

import { useLanguage } from "../../../Context/LanguageProvider"; 
import { Formik, Form, Field, ErrorMessage } from "formik";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";

import useIP from "../../../Hooks/UseIp"; 
import InputField from "../../../Components/InputField/InputField";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import apiService from "../../../../apiService";


function FrmApplicantTypeMst() {

  const { translate } = useLanguage();
  const { user } = useAuth();
  const ipAddress = useIP();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const ulbId = user?.ulbId;
  const userId = user?.userId;
  const applicantTypeId = searchParams.get("applicantTypeId");

  const [initialValues, setInitialValues] = useState({
    ApplicantType: "",
    in_status: "Y", 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicantTypeData = async () => {

      if (applicantTypeId && ulbId) {
        setLoading(true);
        try {
          const response = await apiService.post(
            "FrmApplicantTypeMst",
            {
              appliTypeId: applicantTypeId,
              orgId: ulbId,
            }
          );

          if (response.data && response.data.data) {
            const data = response.data.data;
            setInitialValues({
              ApplicantType: data.APPLITYPENAME || "",
              in_status: data.APPLITYPEFLAG || "Y",
            });
          } else {
            alert(translate("No data found for this Applicant Type ID.")); 
            setInitialValues({
              ApplicantType: "",
              in_status: "Y",
            });
          }
        } catch (err) {
          console.error("Error fetching applicant type data:", err);
          alert(translate("Failed to load applicant type details."));
          setInitialValues({
            ApplicantType: "",
            in_status: "Y",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchApplicantTypeData();
  }, [applicantTypeId, ulbId, translate]);


  if (!userId || !ulbId) {
      if (user === undefined) {
          return <div>{translate("Loading user authentication data...")}</div>;
      }
      return <div>{translate("User authentication details missing. Cannot submit form.")}</div>;
  }

  // Guard for data fetching loading
  if (loading) {
    return <div>{translate("Loading form data...")}</div>; 
  }


  // ----------------------------------------------------
const handleSubmit = async (values, { setSubmitting, resetForm }) => {

  setSubmitting(true);

  const isUpdate = applicantTypeId !== null && applicantTypeId !== undefined;
  const mode = isUpdate ? 2 : 1;

  const payload = {
    In_Userid: userId,
    In_Mode: mode,
    In_ApplitypeId: isUpdate ? Number(applicantTypeId) : null, // send numeric ID
    In_Applitypename: values.ApplicantType,
    In_Applitypeflag: values.in_status,
    In_orgid: Number(ulbId),
    in_ipaddr: ipAddress,
    in_source: "Web",
  };

  console.log("Submitting payload:", payload);

  try {
    const response = await apiService.post("Aomk_Applitype_Ins", payload);

    if (response.data && response.data.errorcode === 9999) {
      const successMessage = mode === 1
        ? translate("Applicant Type Inserted Successfully!")
        : translate("Applicant Type Updated Successfully!");
      alert(successMessage);

      if (mode === 1) {
        resetForm();
      }

      navigate("/Masters/FrmApplicantTypeList.aspx");
    } else {
      alert(
        translate(
          response.data.errormsg || "Failed to save applicant type. Please try again."
        )
      );
    }
  } catch (err) {
    console.error("Error saving applicant type:", err);
    alert(translate("An error occurred while saving. Please try again."));
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्जदार प्रकार मास्टर")}
        />
        <hr />
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={handleSubmit}
      
        >
          {({ isSubmitting }) => (
            <Form className="container mt-4">
              {/* Applicant Type Name */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label
                    text={`${translate("अर्जदाराचे प्रकार")} :`}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <Field name="ApplicantType" component={InputField} />
                  <ErrorMessage
                    name="ApplicantType"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              {/* Status Radio Buttons */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("स्थिती")} :`} required />
                </div>
                <div className="col-md-6 d-flex radio-gap-container">
                  <Field
                    name="in_status"
                    component={RadioButton}
                    value="Y"
                    label={translate("सक्रीय")}
                    id="status-active"
                  />
                  <Field
                    name="in_status"
                    component={RadioButton}
                    value="N"
                    label={translate("निष्क्रिय")}
                    id="status-inactive"
                  />
                  <ErrorMessage
                    name="in_status"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton
                  type="submit"
                  text={translate("अद्यावत करा")}
                  disabled={isSubmitting}
                />
                <SaveButton
                  type="button"
                  text={translate("परत")}
                  onClick={() => navigate("/Masters/FrmApplicantTypeList.aspx")}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmApplicantTypeMst;