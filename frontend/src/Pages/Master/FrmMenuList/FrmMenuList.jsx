import React, { useState, useEffect, useCallback } from "react"; // Add useCallback
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useLanguage } from "../../../Context/LanguageProvider";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import { Formik, Form } from "formik";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import { useAuth } from "../../../Context/AuthContext";

function FrmMenuList() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const { user } = useAuth(); // Get the user object from AuthContext
  const deptId = user?.deptId; // Access deptId using optional chaining

  console.log("Current deptId:", deptId); // You'll see undefined first, then the actual ID

  const { translate } = useLanguage();
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuData = useCallback(async () => {
    if (!deptId) {
      setLoading(false);
      console.log("Dept ID not available yet, skipping API fetch.");
      return; // Exit the function if deptId is undefined
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/FrmMenuList`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dept_id: deptId }), // Use the actual deptId here
      });

      const result = await response.json();
      // Adjust the message check to be dynamic based on the fetched deptId
      if (
        result.message ===
          `Menu data for Department ID '${deptId}' fetched successfully` &&
        result.data
      ) {
        setMenuData(result.data);
      } else {
        setError("Failed to fetch menu data or unexpected response format.");
      }
    } catch (e) {
      console.error("Error fetching menu data:", e);
      setError("Error fetching menu data: " + e.message); // Set error state
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  }, [deptId, API_BASE_URL]); // Dependencies: fetchMenuData will re-create if deptId or API_BASE_URL changes

  // Use useEffect to call fetchMenuData when its dependencies change
  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]); // Depend on the memoized fetchMenuData function

  // Render loading and error states
  if (loading) {
    return <div>{translate("Loading menu data...")}</div>;
  }

  if (error) {
    return <div>{translate(`Error: ${error}`)}</div>;
  }

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("मेनु यादी")}
        />
        <hr />
        <Formik initialValues={{}}>
          <Form>
            <div>
              <SaveButton
                text={translate("Add New")}
                to="/Masters/FrmMenuMst.aspx"
              />
            </div>
            <hr />
            {menuData.length > 0 ? (
              <div className="table-container mt-4">
                <Table
                  headers={[
                    translate("निवडा"),
                    translate("मेनु शीर्षक"),
                    translate("मुख्य मेनु"),
                    translate("Page Type"),
                    translate("Page Path"),
                  ]}
                  data={menuData.map((menuItem) => ({
                    option: (
                      <LinkButton
                        text={translate("निवडा")}
                        to={`/Masters/FrmMenuMst.aspx?menuId=${menuItem.MENUID}&parentId=${menuItem.PARENTMENUID}`}
                      />
                    ),
                    PAGETITLE: menuItem.PAGETITLE,
                    PARENT: menuItem.PARENT,
                    PAGETYPE: menuItem.PAGETYPE,
                    WEBPAGEPATH: menuItem.WEBPAGEPATH,
                  }))}
                  keyMapping={{
                    [translate("निवडा")]: "option",
                    [translate("मेनु शीर्षक")]: "PAGETITLE",
                    [translate("मुख्य मेनु")]: "PARENT",
                    [translate("Page Type")]: "PAGETYPE",
                    [translate("Page Path")]: "WEBPAGEPATH",
                  }}
                />
              </div>
            ) : (
              <div>{translate("No menu data available.")}</div>
            )}
          </Form>
        </Formik>
      </div>
    </div>
  );
}

export default FrmMenuList;
