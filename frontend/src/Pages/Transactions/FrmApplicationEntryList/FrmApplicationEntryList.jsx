import React, { useState, useEffect } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import InputField from "../../../Components/InputField/InputField";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import { Field, Formik, Form, ErrorMessage } from "formik";
import { useLanguage } from "../../../Context/LanguageProvider";
import { useAuth } from "../../../Context/AuthContext";
import apiService from "../../../../apiService";
import Table from "../../../Components/Table/Table";

function FrmApplicationEntryList() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const ulbId = user?.ulbId || user?.UlbId || localStorage.getItem("ulbId");

  const [applications, setApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const initialValues = { search: "" };

  useEffect(() => {
    if (!ulbId) return;

    const fetchApplications = async () => {
      try {
        const response = await apiService.post("FrmApplicationEntryList", { ulbId });
        if (response?.data?.data && Array.isArray(response.data.data)) {
          const dataWithChecked = response.data.data.map((row) => ({
            ...row,
            checked: false, // needed for table checkbox
          }));
          setApplications(dataWithChecked);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("Error fetching applications:", error);
        setApplications([]);
      }
    };

    fetchApplications();
  }, [ulbId]);

  // Filter applications based on search
  const filteredApplications = applications.filter((row) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (
      (row.SHOPNAME?.toLowerCase().includes(lower) || false) ||
      (row.APPLICATIONNO?.toLowerCase().includes(lower) || false) ||
      (row.WARDNAME?.toLowerCase().includes(lower) || false) ||
      (row.ZONENAME?.toLowerCase().includes(lower) || false)
    );
  });

  // Handle select button click
  const handleSelectApplication = (applicationId, applicationNo) => {
    window.location.href = `/Transaction/FrmApplicationEntryMst.aspx?applicationId=${applicationId}`;
  };

  // Table headers and mapping
  const headers = [
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
  ];

  const keyMapping = {
    [translate("निवडा")]: "option",
    [translate("झोन")]: "ZONENAME",
    [translate("वार्ड")]: "WARDNAME",
    [translate("अर्ज क्रमांक")]: "APPLICATIONNO",
    [translate("अर्ज दिनांक")]: "APPLICATIONDATE",
    [translate("दुकानाचे नांव")]: "SHOPNAME",
    [translate("व्यवसाय वर्ष")]: "BUSINESSYEAR",
    [translate("पॅनकार्ड क्र.")]: "PANNO",
    [translate("संपर्क क्र.")]: "CONTACTNO",
    [translate("ईमेल")]: "EMAIL",
    [translate("पत्ता")]: "ADDRESS",
  };

  // Map filteredApplications to table data
  const tableData = filteredApplications.map((row) => ({
    ...row,
    option: (
      <LinkButton
        text={translate("निवडा")}
        onClick={() => handleSelectApplication(row.APPLICATIONID, row.APPLICATIONNO)}
      />
    ),
    APPLICATIONDATE: row.APPLICATIONDATE
      ? new Date(row.APPLICATIONDATE).toLocaleDateString()
      : "-",
  }));

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel className="headerlabel mt-4" text={translate("अर्ज नोंदणी यादी")} />
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
                    onChange={(e) => {
                      handleChange(e);
                      setSearchTerm(e.target.value);
                    }}
                  />
                  <ErrorMessage name="search" component="div" className="text-danger" />
                </div>

                <div className="col-12 col-sm-6 col-md-2 d-flex justify-content-end">
                  <SaveButton
                    type="button"
                    text={translate("नविन जोडा")}
                    to="/Transaction/FrmApplicationEntryMst.aspx"
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>

        <div className="table-responsive mt-4">
          <Table
            headers={headers}
            data={tableData}
            keyMapping={keyMapping}
            checkboxIdentifier="APPLICATIONID"
            onCheckboxChange={(id, field, value) => {
              setApplications((prev) =>
                prev.map((row) => (row.APPLICATIONID === id ? { ...row, [field]: value } : row))
              );
            }}
            onSelectAllChange={(isChecked) => {
              setApplications((prev) => prev.map((row) => ({ ...row, checked: isChecked })));
            }}
            noDataMessage={translate("No data found")}
          />
        </div>
      </div>
    </div>
  );
}

export default FrmApplicationEntryList;
