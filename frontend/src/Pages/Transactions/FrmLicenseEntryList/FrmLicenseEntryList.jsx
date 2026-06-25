import React from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";

function FrmLicenseEntryList() {
  const { translate } = useLanguage();

  const initialValues = {
    search: "", // This field needs to be defined
  };

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("परवाना प्रवेश यादी")} // Use translate for header label
        />
        <hr />

        <Formik initialValues={initialValues}>
          {() => (
            // The Form component from Formik needs to wrap the elements it manages
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-md-6">
                  <Field
                    name="Name"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="Name"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-12 col-sm-6 col-md-2 d-flex justify-content-end justify-content-md-end">
                  <SaveButton
                    type="submit"
                    text={translate("नविन जोडा ")}
                    to="/Transaction/FrmLicenseEntry.aspx"
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmLicenseEntryList;
