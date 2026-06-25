import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
import Table from "../../../Components/Table/Table"; // Import Table component
import LinkButton from "../../../Components/LinkButton/LinkButton"; // Import LinkButton component
import { useNavigate } from "react-router-dom"; // Import useNavigate
import apiService from "../../../../apiService";


function FrmApplicantTypeList() {
  const { user } = useAuth();
  const ulbId = user?.ulbId; // Get ulbId from AuthContext
  const { translate } = useLanguage();
  const navigate = useNavigate(); // Initialize useNavigate

  const [applicantTypeList, setApplicantTypeList] = useState([]); // State to store fetched applicant type data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input

  useEffect(() => {
    const fetchApplicantTypeList = async () => {
      if (!ulbId) {
        setLoading(false);
        setError("Organization ID not available."); // More specific error
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await apiService.post(
          "FrmApplicantTypeList",
          {
            orgId: ulbId, // Corrected payload key to 'orgId' as per your example
          }
        );

        // Check if data is an array
        if (response.data && Array.isArray(response.data.data)) {
          setApplicantTypeList(response.data.data);
        } else {
          setApplicantTypeList([]);
        }
      } catch (err) {
        console.error("Error fetching applicant type list:", err);
        setError("Failed to load applicant type list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantTypeList();
  }, [ulbId]); // Depend on ulbId and translate

  // Memoize filtered list for search functionality
  const filteredApplicantTypeList = useMemo(() => {
    if (!searchTerm) {
      return applicantTypeList; // Return all if no search term
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return applicantTypeList.filter(
      (applicantType) =>
        (applicantType.APPLICITYPENAME &&
          applicantType.APPLICITYPENAME.toLowerCase().includes(
            lowercasedSearchTerm
          )) ||
        (applicantType.APPLICITYPEFLAG &&
          applicantType.APPLICITYPEFLAG.toLowerCase().includes(
            lowercasedSearchTerm
          ))
    );
  }, [applicantTypeList, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const initialValues = {
    search: "",
  };

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("अर्जदारांची प्रकार यादी")} // Updated header text as per image
        />
        <hr />

        <Formik initialValues={initialValues}>
          {() => (
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-12 col-sm-6 col-md-2 d-flex justify-content-center justify-content-md-start">
                  <SaveButton
                    type="button" // Change to type="button" to prevent form submission on click
                    text={translate("नवीन जोडा")} // As per image
                    onClick={() =>
                      navigate("/Masters/FrmApplicantTypeMst.aspx")
                    } // Navigate to add new page
                  />
                </div>
                <div className="col-md-1">
                  <Label text={`${translate("शोधा")} :`} />
                </div>
                <div className="col-md-4">
                  <Field
                    name="search" // Name this field 'search' for consistency with searchTerm state
                    component={InputField}
                    className="form-control"
                    value={searchTerm} // Bind value to searchTerm state
                    onChange={handleSearchChange} // Update searchTerm on change
                    placeholder={translate("Search here...")} // Add a helpful placeholder
                  />
                  <ErrorMessage
                    name="search"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <hr />
            </Form>
          )}
        </Formik>

        {/* Conditional rendering for loading, error, and data */}
        {filteredApplicantTypeList.length > 0 ? (
          <div className="table-container mt-4 w-50">
            {" "}
            {/* w-50 for width as per image */}
            <Table
              headers={[
                translate("निवडा"), // "Select" as per image
                translate("अर्जदाराचे प्रकार"), // "Applicant Type" as per image
                translate("स्थिती"), // "Status" as per image
              ]}
              data={filteredApplicantTypeList.map((applicantType) => ({
                option: (
                  <LinkButton
                    to={`/Masters/FrmApplicantTypeMst.aspx?applicantTypeId=${applicantType.APPLICITYPEID}`}
                    text={translate("निवडा")} // "Select" as per image
                  />
                ),
                "अर्जदाराचे प्रकार": applicantType.APPLICITYPENAME,
                स्थिती: applicantType.APPLICITYPEFLAG, // Displaying 'Active' or 'Inactive' directly
              }))}
              keyMapping={{
                [translate("निवडा")]: "option",
                [translate("अर्जदाराचे प्रकार")]: "अर्जदाराचे प्रकार",
                [translate("स्थिती")]: "स्थिती",
              }}
            />
          </div>
        ) : (
          <p>{translate("No applicant types found.")}</p> // Message if no data
        )}
      </div>
    </div>
  );
}

export default FrmApplicantTypeList;
