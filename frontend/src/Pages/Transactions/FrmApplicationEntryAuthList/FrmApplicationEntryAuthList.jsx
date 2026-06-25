import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { useAuth } from "../../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import apiService from "../../../../apiService"



function FrmApplicationEntryAuthList() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;
  const navigate = useNavigate();
  const [allApplications, setAllApplications] = useState([]); // Stores all fetched data
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input

  const initialValues = {
    search: "",
  };

  // Function to fetch data from the API
  const fetchApplicationList = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('@');

      const response = await apiService.post(
        `site-visit-applications`,
        { 
          OrgId: UlbId,
          Mode: mode 
        }
      );

      if (response.data && response.data.data) {
        setAllApplications(response.data.data); // Store all data
      } else {
        setAllApplications([]);
        console.warn(
          "API response did not contain 'data' array:",
          response.data
        );
      }
    } catch (err) {
      console.error("Error fetching application list:", err);
      setAllApplications([]);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (UlbId) {
      fetchApplicationList();
    }
  }, [UlbId]);

  // Filter the applications based on the search term
  // Use useMemo to re-calculate filtered data only when allApplications or searchTerm changes
  const filteredApplications = useMemo(() => {
    if (!searchTerm) {
      return allApplications; // If no search term, return all data
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allApplications.filter((application) => {
      // Customize your search logic here.
      // You can search across multiple fields.
      // Example: search by application number, shop name, contact number, or address
      return (
        application.APPLICATIONNO?.toLowerCase().includes(
          lowerCaseSearchTerm
        ) ||
        application.SHOPNAME?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.CONTACTNO?.toString().includes(lowerCaseSearchTerm) || // Convert number to string for searching
        application.ADDRESS?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.ZONENAME?.toLowerCase().includes(lowerCaseSearchTerm) || // Added Zone
        application.WARDNAME?.toLowerCase().includes(lowerCaseSearchTerm) || // Added Ward
        application.PANNO?.toLowerCase().includes(lowerCaseSearchTerm) || // Added Pan No
        application.EMAIL?.toLowerCase().includes(lowerCaseSearchTerm) // Added Email
      );
    });
  }, [allApplications, searchTerm]);
  const handleSelectApplication = (applicationId, applicationNo) => {
    console.log(
      "Storing in localStorage - Application ID:",
      applicationId,
      "Application No:",
      applicationNo
    );
    localStorage.setItem("selectedApplicationId", applicationId); // Store application ID
    localStorage.setItem("selectedApplicationNo", applicationNo); // Store application number

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('@');

    // Navigate to the next page using react-router-dom's navigate
    navigate(
      `/Transaction/FrmApplicationEntryAuthMst.aspx?applicationId=${applicationId}`,
      { state: { mode: mode } }
    );
  };
  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्ज अधिकृतताची यादी")}
        />
        <hr />

        <Formik
          initialValues={initialValues}
          // Formik is not strictly necessary for just a search input
          // if it's not part of a form submission with validation.
          // However, keeping it as per your existing structure.
        >
          {() => (
            // Destructure values and handleChange from Formik props
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-md-6">
                  <Field
                    name="search"
                    component={InputField}
                    className="form-control"
                    placeholder={translate("Search here...")}
                    value={searchTerm} // Bind the input value to the searchTerm state
                    onChange={(e) => setSearchTerm(e.target.value)} // Update searchTerm on change
                  />
                  <ErrorMessage
                    name="search"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>

        <div className="table-container">
          <Table
            headers={[
              translate("निवडा"),
              translate("झोन"),
              translate("वार्ड"),
              translate("अर्ज क्रमांक"),
              translate("अर्ज दिनांक"),
              translate("दुकानाचे नांव"),
              translate("व्यवसाय वर्ष"),
              translate("पॅनकार्ड क्र."),
              translate("संपर्क क्र."),
              translate("ईमेल"),
              translate("पत्ता"),
            ]}
            data={filteredApplications.map((row) => ({
              // Use filteredApplications here
              option: (
                <LinkButton
                  // to={`/Transaction/FrmApplicationEntryAuthMst.aspx?applicationId=${row.APPLICATIONID}`}
                  text={translate("निवडा")}
                  onClick={() =>
                    handleSelectApplication(
                      row.APPLICATIONID,
                      row.APPLICATIONNO
                    )
                  }
                />
              ),
              [translate("झोन")]: row.ZONENAME,
              [translate("वार्ड")]: row.WARDNAME,
              [translate("अर्ज क्रमांक")]: row.APPLICATIONNO,
              [translate("अर्ज दिनांक")]: row.APPLICATIONDATE
                ? new Date(row.APPLICATIONDATE).toLocaleDateString("en-GB")
                : "",
              [translate("दुकानाचे नांव")]: row.SHOPNAME,
              [translate("व्यवसाय वर्ष")]: row.BUSINESSYEAR,
              [translate("पॅनकार्ड क्र.")]: row.PANNO,
              [translate("संपर्क क्र.")]: row.CONTACTNO,
              [translate("ईमेल")]: row.EMAIL,
              [translate("पत्ता")]: row.ADDRESS,
            }))}
            keyMapping={{
              [translate("निवडा")]: "option",
              [translate("झोन")]: translate("झोन"),
              [translate("वार्ड")]: translate("वार्ड"),
              [translate("अर्ज क्रमांक")]: translate("अर्ज क्रमांक"),
              [translate("अर्ज दिनांक")]: translate("अर्ज दिनांक"),
              [translate("दुकानाचे नांव")]: translate("दुकानाचे नांव"),
              [translate("व्यवसाय वर्ष")]: translate("व्यवसाय वर्ष"),
              [translate("पॅनकार्ड क्र.")]: translate("पॅनकार्ड क्र."),
              [translate("संपर्क क्र.")]: translate("संपर्क क्र."),
              [translate("ईमेल")]: translate("ईमेल"),
              [translate("पत्ता")]: translate("पत्ता"),
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default FrmApplicationEntryAuthList;
