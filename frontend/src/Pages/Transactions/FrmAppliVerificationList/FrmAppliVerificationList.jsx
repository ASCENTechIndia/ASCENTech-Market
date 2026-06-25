import React, { useState, useEffect, useMemo } from "react"; // Import useMemo
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { useAuth } from "../../../Context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";

// Import the external API service
import apiService from "../../../../apiService"; // Adjust path as per your project structure

function FrmApplicationEntryList() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;

  // Stores all fetched data
  const [allApplications, setAllApplications] = useState([]);
  // State for the search input
  const [searchTerm, setSearchTerm] = useState("");

  const initialValues = {
    search: "",
  };

  // Function to fetch data using apiService
  const fetchApplicationList = async () => {
    try {
      // Use apiService.post instead of the raw fetch function
      const response = await apiService.post(
        `FrmAppliVerificationList`, // Endpoint without base URL
        { ulbId: UlbId }
      );

      if (response.data && Array.isArray(response.data.data)) {
        setAllApplications(response.data.data); // Store all data
      } else {
        setAllApplications([]);
        console.warn("API response did not contain 'data' array:", response.data);
      }
    } catch (err) {
      console.error("Error fetching application list:", err);
      setAllApplications([]);
    }
  };

  // Fetch data on component mount/UlbId change
  useEffect(() => {
    if (UlbId) {
      fetchApplicationList();
    }
  }, [UlbId]);


  // Use useMemo for efficient client-side filtering
  const filteredApplications = useMemo(() => {
    if (!searchTerm) {
      return allApplications; // If no search term, return all data
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allApplications.filter((application) => {
      // Search across multiple fields
      return (
        application.APPLICATIONNO?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.SHOPNAME?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.CONTACTNO?.toString().includes(lowerCaseSearchTerm) ||
        application.ADDRESS?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.ZONENAME?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.WARDNAME?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.PANNO?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.EMAIL?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    });
  }, [allApplications, searchTerm]);


  const handleLinkButtonClick = (applicationNo) => {
    localStorage.setItem("applicationNo", applicationNo);
    console.log(`Selected Application No: ${applicationNo}`);
  };

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्ज पडताळणी यादी")}
        />
        <hr />

        <Formik initialValues={initialValues}>
          {({ handleChange }) => (
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-md-6">
                  <Field
                    name="search"
                    component={InputField}
                    className="form-control"
                    placeholder={translate("Search here...")}
                    // Bind the input value to the searchTerm state for filtering
                    value={searchTerm}
                    onChange={(e) => {
                      handleChange(e);
                      setSearchTerm(e.target.value); // Update state to trigger filtering
                    }}
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

        <div className="table-responsive mt-4">
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
            // Use the filtered list here
            data={filteredApplications.map((row) => ({
              option: (
                <LinkButton
                  to={`/Transaction/FrmAppliVerificationMst.aspx?applicationId=${row.APPLICATIONID}`}
                  text={translate("निवडा")}
                  onClick={() => handleLinkButtonClick(row.APPLICATIONNO)}
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

export default FrmApplicationEntryList;