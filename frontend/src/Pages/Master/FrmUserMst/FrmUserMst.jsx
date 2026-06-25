import React, { useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Checkbox from "../../../Components/Checkbox/checkbox";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
function FrmUserMst() {
  const { translate } = useLanguage();

  const initialValues = {
    UserId: "",
    FirstName: "",
    SurName: "",
    Password: "",
    ConfirmPassword: "",
    UserType: "",
    MobileNo: "",
    FromDate: null,
    ToDate: null,
    SankalanCenter: "",
    otpBaseLogin: false, // Initialize the checkbox state
  };
  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("वापरकर्ता मास्टर")}
        />
        <hr />
        <Formik
          initialValues={initialValues}
          enableReinitialize={true} // Useful if initialValues can change
        >
          {({ values, setFieldValue }) => (
            <Form className="container mt-4">
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("वापरकर्ताचे आयडी")} :`} required />
                  <Field
                    name="UserId"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="UserId"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("पहिले नाव")} :`} required />
                  <Field
                    name="FirstName"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="FirstName"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("आडनाव")} :`} />
                  <Field
                    name="SurName"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="SurName"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("पासवर्ड")} :`} required />
                  <Field
                    name="Password"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="Password"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label
                    text={`${translate("पासवर्डची पुष्टी करा")} :`}
                    required
                  />
                  <Field
                    name="ConfirmPassword"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="ConfirmPassword"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("वापरकर्ताचे प्रकार")} :`} />
                  <Field
                    name="UserType"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                  />
                  <ErrorMessage
                    name="UserType"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("मोबाईल क्र.")} :`} required />
                  <Field
                    name="MobileNo"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="MobileNo"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पासून")} :`} required />
                  <CalendarIcon
                    setSelectedDate={(date) => setFieldValue("FromDate", date)} // Pass setFieldValue for FromDate
                    placeholder={translate("DD/MM/YYYY")}
                    autoSelectToday={false} // Changed to boolean false as per your requirement
                    // Add classname for validation styling if needed
                    className="form-control"
                  />
                  <ErrorMessage
                    name="FromDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                {/* To Date */}
                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पर्यंत")} :`} required />
                  <CalendarIcon
                    setSelectedDate={(date) => setFieldValue("ToDate", date)} // Pass setFieldValue for ToDate
                    placeholder={translate("DD/MM/YYYY")}
                    autoSelectToday={false} // Changed to boolean false
                    // Add classname for validation styling if needed
                    className="form-control"
                  />
                  <ErrorMessage
                    name="ToDate"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("चालु मर्यादा")} :`} required />
                  <Field
                    name="CurrentBound"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="CurrentBound"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("विभाग")} :`} required />
                  <Field
                    name="Division"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                  />
                  <ErrorMessage
                    name="Division"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("हुद्दा ")} :`} />
                  <Field
                    name="Designation"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                  />
                  <ErrorMessage
                    name="Designation"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("संकलन केंद्र")} :`} required />
                  <Field
                    name="SankalanCenter"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                  />
                  <ErrorMessage
                    name="SankalanCenter"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4 d-flex align-items-center">
                  <Label text={`${translate("OTP base Login")} :`} />

                  <div className="ms-3">
                    <Checkbox
                      id="otpBaseLogin"
                      label="" // Keep this empty as the main label is handled by the Label component
                      checked={values.otpBaseLogin}
                      onChange={() =>
                        setFieldValue("otpBaseLogin", !values.otpBaseLogin)
                      }
                    />
                  </div>
                </div>
                <div className="d-flex justify-content-center gap-4 mt-4">
                  <SaveButton type="submit" text={translate("साठवा")} />
                  <SaveButton type="button" text={translate("परत")} />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmUserMst;
