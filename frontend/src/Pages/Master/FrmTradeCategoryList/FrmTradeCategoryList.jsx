import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext"; // Import useAuth to get OrgId
import Table from "../../../Components/Table/Table"; // Assuming you have a Table component
import LinkButton from "../../../Components/LinkButton/LinkButton"; // Assuming you have a LinkButton component
import apiService from "../../../../apiService";
import { useNavigate } from "react-router-dom"; // Import useNavigate



function FrmTradeCategoryList() {
  const { user } = useAuth();
  const orgId = user?.ulbId; // Assuming ulbId maps to OrgId for your API
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const [tradeCategoryList, setTradeCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Keep error state for console logging if needed, but won't render
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTradeCategoryList = async () => {
      if (!orgId) {
        setLoading(false);
        // Optionally log error for debugging without displaying to user
        console.error("Organization ID not available.");
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const response = await apiService.post(
          `FrmTradeCategoryList`,
          {
            OrgId: orgId, // Use OrgId as per your API requirement
          }
        );

        if (
          response.data &&
          response.data.errorCode === 9999 &&
          Array.isArray(response.data.data)
        ) {
          setTradeCategoryList(response.data.data);
        } else {
          setTradeCategoryList([]);
          console.warn(
            "API response data for trade category list is not an array or empty:",
            response.data
          );
          // Do not set error for display, just log warning
        }
      } catch (err) {
        console.error("Error fetching trade category list:", err);
        // Do not set error for display
      } finally {
        setLoading(false);
      }
    };

    fetchTradeCategoryList();
  }, [orgId, translate]); // Dependencies for useEffect

  // Memoize filtered list for search functionality
  const filteredTradeCategoryList = useMemo(() => {
    if (!searchTerm) {
      return tradeCategoryList;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return tradeCategoryList.filter(
      (categoryItem) =>
        (categoryItem.VAR_TRADECATEGORY_NAME &&
          categoryItem.VAR_TRADECATEGORY_NAME.toLowerCase().includes(
            lowercasedSearchTerm
          )) ||
        (categoryItem.VAR_TRADECATEGORY_FLAG &&
          categoryItem.VAR_TRADECATEGORY_FLAG.toLowerCase().includes(
            lowercasedSearchTerm
          ))
    );
  }, [tradeCategoryList, searchTerm]);

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
          text={translate("Trade Category List")}
        />
        <hr />

        <Formik initialValues={initialValues}>
          {() => (
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-12 col-sm-6 col-md-2 d-flex justify-content-center justify-content-md-start">
                  <SaveButton
                    type="button" // Change to button type to prevent form submission
                    text={translate("Add New")}
                    onClick={() =>
                      navigate("/Masters/FrmTradeCategoryMst.aspx")
                    }
                  />
                </div>
                <div className="col-md-1">
                  <Label text={`${translate("Search")} :`} />
                </div>
                <div className="col-md-4">
                  <Field
                    name="search" // Consistent name for search field
                    component={InputField}
                    className="form-control"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder={translate("Type here to search...")}
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

        {/* Render table only if not loading and there is data */}
        {filteredTradeCategoryList.length > 0 && (
          <div className="table-responsive mt-4 w-50">
            <Table
              headers={[
                translate("Select"),
                translate("Trade Category Name"),
                translate("Status"),
              ]}
              data={filteredTradeCategoryList.map((categoryItem) => ({
                option: (
                  <LinkButton
                    to={`/Masters/FrmTradeCategoryMst.aspx?tradeCategoryId=${categoryItem.NUM_TRADECATEGORY_ID}`} // Pass ID for editing
                    text={translate("Select")}
                  />
                ),
                "Trade Category Name": categoryItem.VAR_TRADECATEGORY_NAME,
                Status: categoryItem.VAR_TRADECATEGORY_FLAG,
              }))}
              keyMapping={{
                [translate("Select")]: "option",
                [translate("Trade Category Name")]: "Trade Category Name",
                [translate("Status")]: "Status",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmTradeCategoryList;
