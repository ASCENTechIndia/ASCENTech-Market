import React, { useEffect, useState, useRef, useCallback } from "react"; // Import useCallback
import axios from "axios";
import { useAuth } from "../../../Context/AuthContext";
import useIP from "../../../Hooks/UseIp";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field } from "formik";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Table from "../../../Components/Table/Table";
import { useNavigate } from "react-router-dom"; // Still import useNavigate if used elsewhere, but not for page refresh

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmTradeCategoryConfig() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate(); // Keep navigate if you use it for other purposes, e.g., on back button
  const UlbId = user?.ulbId;
  const ipAddress = useIP();
  const [corporationOptions, setCorporationOptions] = useState([]);
  const [tradeCategories, setTradeCategories] = useState([]);
  const [isTradeCategoriesLoaded, setIsTradeCategoriesLoaded] = useState(false);

  // Use a ref to store the *original* selected categories when the form loads.
  const initialConfiguredCategoriesRef = useRef([]);

  const [formikInitialValues, setFormikInitialValues] = useState({
    Name: UlbId || "",
    selectedTradeCategories: [],
  });

  // --- NEW: Extracted data fetching logic into a useCallback function ---
  const fetchTradeCategoriesData = useCallback(async () => {
    if (!UlbId) {
      setIsTradeCategoriesLoaded(true);
      return;
    }

    try {
      const [allCategoriesRes, configuredCategoriesRes] = await Promise.all([
        axios.post(`${API_BASE_URL}/FrmTradeCategoryConfig`, { ulbId: UlbId }),
        axios.post(`${API_BASE_URL}/getConfiguredTradeCategories`, {
          ulbId: UlbId,
        }),
      ]);

      let allCategories = [];
      if (allCategoriesRes.data && Array.isArray(allCategoriesRes.data.data)) {
        allCategories = allCategoriesRes.data.data;
        setTradeCategories(allCategories);
      } else {
        console.warn("Invalid all trade category data:", allCategoriesRes.data);
      }

      let configuredCategoryIds = [];
      if (
        configuredCategoriesRes.data &&
        Array.isArray(configuredCategoriesRes.data.data)
      ) {
        configuredCategoryIds = configuredCategoriesRes.data.data.map(
          (category) => category.TRADECATID
        );
      } else {
        console.warn(
          "Invalid configured trade category data:",
          configuredCategoriesRes.data
        );
      }

      // Update Formik's initial values to reflect the newly fetched data
      // This will cause Formik to re-render and re-initialize its state with the latest selections
      setFormikInitialValues({
        Name: UlbId,
        selectedTradeCategories: configuredCategoryIds,
      });

      // Update the ref with the newly fetched initial configuration for comparison
      initialConfiguredCategoriesRef.current = configuredCategoryIds;
    } catch (err) {
      console.error("Error fetching trade categories data:", err);
      setFormikInitialValues({
        Name: UlbId,
        selectedTradeCategories: [],
      });
      initialConfiguredCategoriesRef.current = []; // Clear ref on error
      setTradeCategories([]);
    } finally {
      setIsTradeCategoriesLoaded(true);
    }
  }, [UlbId]); // Depend on UlbId, so the function itself updates if UlbId changes

  // Fetch Corporation Dropdown (independent of UlbId)
  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/CorporationDropdown`);
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((corp) => ({
            value: corp.CORPID,
            label: corp.CORPNAME,
          }));
          setCorporationOptions(options);
        } else {
          setCorporationOptions([]);
          console.warn("Invalid corporation data:", response.data);
        }
      } catch (err) {
        console.error("Error fetching corporation dropdown:", err);
      }
    };
    fetchCorporations();
  }, []);

  // --- Initial Data Fetch (now uses the extracted function) ---
  useEffect(() => {
    fetchTradeCategoriesData();
  }, [fetchTradeCategoriesData]); // Depend on the memoized fetchTradeCategoriesData function

  // Handler for individual checkbox changes, updates Formik's internal state
  const handleTradeCategoryCheckboxChange = useCallback(
    (
      tradeCatId,
      checked,
      setFieldValue, // Formik's helper to update a field value
      currentSelectedCategories // Current array of selected categories from Formik's state
    ) => {
      setFieldValue(
        "selectedTradeCategories",
        checked
          ? [...currentSelectedCategories, tradeCatId] // Add if checked
          : currentSelectedCategories.filter((id) => id !== tradeCatId) // Remove if unchecked
      );
    },
    [] // No dependencies, as it only uses props/helpers passed directly
  );

  // Form submission handler
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    // Added resetForm here
    setSubmitting(true);

    const wasPreviouslySelectedIds = initialConfiguredCategoriesRef.current;

    const in_str_array = tradeCategories.map((category) => {
      const tradeCatId = category.TRADECATID;
      const wasPreviouslySelected =
        wasPreviouslySelectedIds.includes(tradeCatId);
      const isCurrentlySelected =
        values.selectedTradeCategories.includes(tradeCatId);

      const previousStatus = wasPreviouslySelected ? "Y" : "N";
      const currentStatus = isCurrentlySelected ? "Y" : "N";

      return `${tradeCatId}#${previousStatus}#${currentStatus}`;
    });

    const payload = {
      in_UserId: user?.userId || "UNKNOWN",
      in_Orgid: UlbId,
      in_str: in_str_array.join("$"),
      in_Mode: 2,
      in_ipaddress: ipAddress,
      in_source: "Web",
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/aomk_TradeCategoryconfig_ins`,
        payload
      );

      if (response.data) {
        alert(translate(response.data.outErrorMsg || "Operation completed."));

        if (response.data.success) {
          // --- CHANGE HERE: Instead of navigate, re-fetch data ---
          // This will update the state, and Formik will re-initialize with the new data
          // causing the component to visually "refresh" with the latest configurations.
          setIsTradeCategoriesLoaded(false); // Optional: show loading state again
          await fetchTradeCategoriesData(); // Re-fetch the data to update the UI
          // No need to call resetForm if fetchTradeCategoriesData updates initialValues
          // and enableReinitialize={true} is set in Formik.
        }
      } else {
        alert(translate("An unexpected response was received."));
      }
    } catch (error) {
      console.error("Error saving trade category configuration:", error);
      alert(
        translate(
          error.response?.data?.outErrorMsg ||
            "Failed to save trade category configuration. Please try again."
        )
      );
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
          text={translate("Trade Type Category Config")}
        />
        <hr />
        {isTradeCategoriesLoaded ? (
          <Formik
            initialValues={formikInitialValues}
            enableReinitialize={true} // Keep this true for Formik to pick up new initialValues
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, values, isSubmitting }) => (
              <Form>
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label
                      text={`${translate("नगरपालिकेचे नाव ")} :`}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <Field
                      name="Name"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      placeholder={translate("Select option")}
                      options={corporationOptions}
                      disabled
                    />
                  </div>
                </div>
                {tradeCategories.length > 0 && (
                  <div className="table-container mt-4">
                    <Table
                      headers={[
                        translate("Select"),
                        translate("Trade Type Category"),
                      ]}
                      data={tradeCategories.map((category) => ({
                        ...category,
                        // Ensure the 'checked' property reflects Formik's current state
                        checked: values.selectedTradeCategories.includes(
                          category.TRADECATID
                        ),
                      }))}
                      keyMapping={{
                        [translate("Select")]: "checked",
                        [translate("Trade Type Category")]: "TRADECATNAME",
                      }}
                      onCheckboxChange={(tradeCatId, key, checked) =>
                        handleTradeCategoryCheckboxChange(
                          tradeCatId,
                          checked,
                          setFieldValue,
                          values.selectedTradeCategories
                        )
                      }
                      showCheckboxInHeader={false}
                      checkboxIdentifier="TRADECATID"
                    />
                  </div>
                )}
                <div className="d-flex justify-content-center gap-4 mt-4">
                  <SaveButton
                    type="submit"
                    text={
                      isSubmitting ? translate("Saving...") : translate("साठवा")
                    }
                    disabled={isSubmitting}
                  />
                  <SaveButton
                    type="button"
                    text={translate("परत")}
                    onClick={() => navigate(-1)} // Keep this if the "Back" button should still navigate
                    disabled={isSubmitting}
                  />
                </div>
              </Form>
            )}
          </Formik>
        ) : (
          <p>{translate("Loading trade categories...")}</p>
        )}
      </div>
    </div>
  );
}

export default FrmTradeCategoryConfig;
