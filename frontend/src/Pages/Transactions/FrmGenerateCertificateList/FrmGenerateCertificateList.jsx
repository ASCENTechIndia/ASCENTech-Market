import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton"; // Not used in this specific form section, but kept if needed elsewhere
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import { Formik, Form, Field, ErrorMessage } from "formik";
import apiService from "../../../../apiService";
import { useAuth } from "../../../Context/AuthContext";


function FrmGenerateCertificateList() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  // Assuming user?.ulbId corresponds to In_OrgId
  const In_OrgId = user?.ulbId;

  const [allApplications, setAllApplications] = useState([]); // Stores all fetched data
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input

  const initialValues = {
    search: "",
  };

  // Function to fetch data from the API
  const fetchApplicationList = async () => {
    try {
      const response = await apiService.post(
        `BindApplicationDtlsForGenerateCerti`, // <-- New API endpoint
        { In_OrgId: In_OrgId } // <-- New request body parameter
      );
      // Check if response.data.applications exists and is an array
      if (response.data && Array.isArray(response.data.applications)) {
        setAllApplications(response.data.applications); // <-- Accessing 'applications' key
      } else {
        setAllApplications([]);
        console.warn(
          "API response did not contain 'applications' array or was invalid:",
          response.data
        );
      }
    } catch (err) {
      console.error(
        "Error fetching application list for certificate generation:",
        err
      );
      setAllApplications([]);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (In_OrgId) {
      fetchApplicationList();
    }
  }, [In_OrgId]);

  // Filter the applications based on the search term
  const filteredApplications = useMemo(() => {
    if (!searchTerm) {
      return allApplications; // If no search term, return all data
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return allApplications.filter((application) => {
      // Customize your search logic here to match the columns in the new API response
      return (
        application.APPLICATIONNO?.toLowerCase().includes(
          lowerCaseSearchTerm
        ) ||
        application.SHOPNAME?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.CONTACTNO?.toString().includes(lowerCaseSearchTerm) ||
        application.ADDRESS?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.ZONENAME?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.WARDNAME?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.PANNO?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.EMAIL?.toLowerCase().includes(lowerCaseSearchTerm) ||
        application.OLDLICENCNO?.toLowerCase().includes(lowerCaseSearchTerm) // Added OLDLICENCNO for search
      );
    });
  }, [allApplications, searchTerm]);

  const handleSelectApplication = (applicationId, oldLicenseNo) => {
    // Store OLDLICENCNO in localStorage
    if (oldLicenseNo) {
      localStorage.setItem("selectedLicenseNo", oldLicenseNo);
      console.log("Stored selectedLicenseNo in localStorage:", oldLicenseNo);
    } else {
      console.warn("OLDLICENCNO is undefined for selected application.");
      localStorage.removeItem("selectedLicenseNo"); // Clear if no value
    }

    // Navigate to the certificate generation page
    navigate(
      `/Transaction/FrmGenerateCertificateMst.aspx?applicationId=${applicationId}`
    );
  };

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          // Updated header text to reflect "Generate Certificate List"
          text={translate("प्रमाणपत्र निर्मिती")}
        />
        <hr />

        <Formik initialValues={initialValues}>
          {() => (
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-md-6">
                  <Field
                    name="search"
                    component={InputField}
                    className="form-control"
                    placeholder={translate("Search here...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <ErrorMessage
                    name="search"
                    component="div"
                    className="text-danger"
                  />
                </div>
                {/* Removed the 'नविन जोडा' button as it doesn't seem to fit "Generate Certificate List" */}
                {/* If needed, you can re-add it here */}
              </div>
            </Form>
          )}
        </Formik>

        <div className="certi_change_table">
          <Table
            headers={[
              translate("निवडा"),
              translate("झोन"),
              translate("वार्ड"),
              translate("अर्ज क्रमांक"),
              translate("अर्ज दिनांक"),
              translate("दुकानाचे नांव"),
              translate("व्यवसाय सुरु केलेले वर्ष"),
              translate("पॅनकार्ड क्र."),
              translate("संपर्क क्र."),
              translate("ईमेल"),
              translate("पत्ता"),
            ]}
            data={filteredApplications.map((row) => ({
              option: (
                // Changed the 'to' path as per the image (FrmGenerateCertificateList.aspx -> FrmGenerateCertificate.aspx)
                // Assuming you want to pass APPLICATIONID to the next page for generating the certificate
                <LinkButton
                  onClick={() =>
                    handleSelectApplication(row.APPLICATIONID, row.OLDLICENCNO)
                  }
                  text={translate("निवडा")}
                />
              ),
              [translate("झोन")]: row.ZONENAME,
              [translate("वार्ड")]: row.WARDNAME,
              [translate("अर्ज क्रमांक")]: row.APPLICATIONNO,
              // Format date for display (e.g., DD/MM/YYYY)
              [translate("अर्ज दिनांक")]: row.APPLICATIONDATE
                ? new Date(row.APPLICATIONDATE).toLocaleDateString("en-GB")
                : "",
              [translate("दुकानाचे नांव")]: row.SHOPNAME,
              [translate("व्यवसाय सुरु केलेले वर्ष")]: row.BUSINESSYEAR,
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
              [translate("व्यवसाय सुरु केलेले वर्ष")]: translate(
                "व्यवसाय सुरु केलेले वर्ष"
              ),
              [translate("पॅनकार्ड क्र.")]: translate("पॅनकार्ड क्र."),
              [translate("संपर्क क्र.")]: translate("संपर्क क्र."),
              [translate("ईमेल")]: translate("ईमेल"),
              [translate("पत्ता")]: translate("पत्ता"),
            }}
          />
        </div>
        {filteredApplications.length === 0 && searchTerm && (
          <p className="text-center mt-3">
            {translate("आपल्या शोधाशी जुळणारे कोणतेही अर्ज नाहीत.")}
          </p>
        )}
        {filteredApplications.length === 0 &&
          !searchTerm &&
          allApplications.length === 0 && (
            <p className="text-center mt-3">
              {translate("कोणतेही अर्ज उपलब्ध नाहीत.")}
            </p>
          )}
      </div>
    </div>
  );
}

export default FrmGenerateCertificateList;
