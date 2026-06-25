import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar"; // Corrected path from HOC to HCHOC based on previous context if it exists
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
import Table from "../../../Components/Table/Table"; // Import Table component
import LinkButton from "../../../Components/LinkButton/LinkButton"; // Import LinkButton component
import apiService from "../../../../apiService";
import { useNavigate } from "react-router-dom"; // Import useNavigate


function FrmDocumentMasterList() {
  const { user } = useAuth();
  const ulbId = user?.ulbId; // Get ulbId from AuthContext
  const { translate } = useLanguage();
  const navigate = useNavigate(); // Initialize useNavigate

  const [documentMasterList, setDocumentMasterList] = useState([]); // State to store fetched document master data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input

  useEffect(() => {
    const fetchDocumentMasterList = async () => {
      if (!ulbId) {
        setLoading(false);
        setError(translate("Organization ID not available.")); // More specific error
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await apiService.post(
          "FrmDocumentMasterList",
          {
            orgId: ulbId,
          }
        );

        // Check if data is an array
        if (response.data && Array.isArray(response.data.data)) {
          setDocumentMasterList(response.data.data);
        } else {
          setDocumentMasterList([]);
          console.warn(
            "API response data for document master is not an array or empty:",
            response.data
          );
        }
      } catch (err) {
        console.error("Error fetching document master list:", err);
        setError(
          translate("Failed to load document master list. Please try again.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentMasterList();
  }, [ulbId, translate]); // Depend on ulbId and translate

  // Memoize filtered list for search functionality
  const filteredDocumentMasterList = useMemo(() => {
    if (!searchTerm) {
      return documentMasterList; // Return all if no search term
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return documentMasterList.filter(
      (documentItem) =>
        (documentItem.DOCNAME &&
          documentItem.DOCNAME.toLowerCase().includes(lowercasedSearchTerm)) ||
        (documentItem.DOCFLAG &&
          documentItem.DOCFLAG.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [documentMasterList, searchTerm]);

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
          text={translate("दस्तऐवज मास्टर यादी")} // Use translate for header label
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
                      navigate("/Masters/FrmDocumentMasterMst.aspx")
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

        {filteredDocumentMasterList.length > 0 ? (
          <div className="table-container mt-4 w-50">
            <Table
              headers={[
                translate("निवडा"), // "Select" as per image
                translate("दस्तऐवजाचे नांव"), // "Document Name" as per image
                translate("स्थिती"), // "Status" as per image
              ]}
              data={filteredDocumentMasterList.map((documentItem) => ({
                option: (
                  <LinkButton
                    to={`/Masters/FrmDocumentMasterMst.aspx?documentId=${documentItem.DOCID}`}
                    text={translate("निवडा")} // "Select" as per image
                  />
                ),
                "दस्तऐवजाचे नांव": documentItem.DOCNAME,
                स्थिती: documentItem.DOCFLAG,
              }))}
              keyMapping={{
                [translate("निवडा")]: "option",
                [translate("दस्तऐवजाचे नांव")]: "दस्तऐवजाचे नांव",
                [translate("स्थिती")]: "स्थिती",
              }}
            />
          </div>
        ) : (
          <p>{translate("No document master data found.")}</p> // Message if no data
        )}
      </div>
    </div>
  );
}

export default FrmDocumentMasterList;
