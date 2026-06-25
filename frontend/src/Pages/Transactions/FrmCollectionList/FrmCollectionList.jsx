import React, { useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import InputField from "../../../Components/InputField/InputField";
import Label from "../../../Components/Label/Label";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import apiService from "../../../../apiService";
import { useAuth } from "../../../Context/AuthContext";

// Import Table and LinkButton components as they will be used for the results
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";

function FrmCollectionList() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const OrgId = user?.ulbId; // Assuming ulbId from AuthContext maps to OrgId

  const [collectionData, setCollectionData] = useState([]);

  const initialValues = {
    licenseNo: "",
    billNo: "",
    shopName: "",
  };

  const handleSubmit = async (values) => {
    setCollectionData([]); // Clear previous results
    if (!values.licenseNo && !values.billNo && !values.shopName) {
      alert("|| Enter LicenseNo OR BillNo OR Shopname ||");
      return;
    }
    try {
      const response = await apiService.post(`FrmCollectionList`, {
        OrgId: OrgId,
        LicenseNo: values.licenseNo || null,
        BillNo: values.billNo || null,
        ShopName: values.shopName || null,
      });

      // Your existing check for successful data binding
      if (response.data && response.data.data) {
        // If the API returns a 'data' object (containing the details)
        setCollectionData([response.data.data]); // Wrap single object in array for Table
      } else {
        // This 'else' block executes if 'response.data' is null/undefined OR 'response.data.data' is null/undefined.
        // Now, we'll refine it to check for your specific 'no data' message pattern.
        setCollectionData([]); // Ensure collectionData is explicitly empty

        if (
          response.data &&
          response.data.success === false &&
          response.data.message
        ) {
          // If response.data exists, 'success' is false, and there's a 'message'
          alert(response.data.message); // Show the specific "No market license application details found" alert
        } else {
          // Fallback for other unexpected 'no data' scenarios (e.g., success: true but no data, or missing message)
          alert(
            "No market license application details found for the provided criteria."
          );
          console.warn(
            "API response did not contain expected 'data' or a clear 'no data' message:",
            response.data
          );
        }
      }
    } catch (err) {
      console.error("Error fetching collection list:", err);
      setCollectionData([]); // Clear data on error

      // Better error handling for network/server issues
      if (err.response) {
        // Server responded with an error status (e.g., 4xx, 5xx)
        if (err.response.data && err.response.data.message) {
          alert(`${err.response.data.message}`);
        } else {
          alert(
            `Server Error: Status ${err.response.status}. Please try again.`
          );
        }
      } else if (err.request) {
        // Request was made but no response was received (e.g., network down)
        alert(
          "No response from the server. Please check your internet connection."
        );
      } else {
        // Something else happened in setting up the request
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container mt-5">
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {() => (
            <Form>
              <div className="row mb-3 mt-4">
                <div className="col-md-4">
                  <Label text={`${translate("License No")} :`} />
                  <Field
                    name="licenseNo"
                    component={InputField}
                    className="form-control"
                    type="text"
                  />
                  <ErrorMessage
                    name="licenseNo"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("Bill No")} :`} />
                  <Field
                    name="billNo"
                    component={InputField}
                    className="form-control"
                    type="text"
                  />
                  <ErrorMessage
                    name="billNo"
                    component="div"
                    className="text-danger"
                  />
                </div>
                <div className="col-md-4">
                  <Label text={`${translate("Shop Name")} :`} />
                  <Field
                    name="shopName"
                    component={InputField}
                    className="form-control"
                    type="text"
                  />
                  <ErrorMessage
                    name="shopName"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center flex-direction-row mt-4">
                <SaveButton type="submit" text={translate("Search")} />
              </div>
            </Form>
          )}
        </Formik>

        <div className="certi_change_table mt-5">
          {collectionData.length > 0 && (
            <Table
              headers={[
                translate("निवडा"),
                translate("वार्ड"),
                translate("LicenseNo"),
                translate("अर्ज दिनांक"),
                translate("दुकानाचे नांव"),
                translate("billno"),
                translate("व्यवसाय वर्ष"),
                translate("पॅनकार्ड क्र."),
                translate("संपर्क क्र."),
                translate("ईमेल"),
                translate("पत्ता"),
              ]}
              data={collectionData.map((row) => ({
                option: (
                  <LinkButton
                    to={`/Transaction/FrmCollection.aspx?licenseNo=${row.LICNO}&applicationId=${row.APPLICATIONID}`}
                    text={translate("निवडा")}
                  />
                ),
                [translate("वार्ड")]: row.WARDNAME,
                [translate("LicenseNo")]: row.LICNO,
                [translate("अर्ज दिनांक")]: row.APPLICATIONDATE
                  ? new Date(row.APPLICATIONDATE).toLocaleDateString("en-GB")
                  : "",
                [translate("दुकानाचे नांव")]: row.SHOPNAME,
                [translate("billno")]: row.BILLNO,
                [translate("व्यवसाय वर्ष")]: row.BUSINESSYEAR,
                [translate("पॅनकार्ड क्र.")]: row.PANNO,
                [translate("संपर्क क्र.")]: row.CONTACTNO,
                [translate("ईमेल")]: row.EMAIL,
                [translate("पत्ता")]: row.ADDRESS,
              }))}
              keyMapping={{
                [translate("निवडा")]: "option",
                [translate("वार्ड")]: translate("वार्ड"),
                [translate("LicenseNo")]: translate("LicenseNo"),
                [translate("अर्ज दिनांक")]: translate("अर्ज दिनांक"),
                [translate("दुकानाचे नांव")]: translate("दुकानाचे नांव"),
                [translate("billno")]: translate("billno"),
                [translate("व्यवसाय वर्ष")]: translate("व्यवसाय वर्ष"),
                [translate("पॅनकार्ड क्र.")]: translate("पॅनकार्ड क्र."),
                [translate("संपर्क क्र.")]: translate("संपर्क क्र."),
                [translate("ईमेल")]: translate("ईमेल"),
                [translate("पत्ता")]: translate("पत्ता"),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default FrmCollectionList;
