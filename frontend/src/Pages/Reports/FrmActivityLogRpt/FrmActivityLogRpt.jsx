import React, { useEffect, useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
import axios from "axios";
import Table from "../../../Components/Table/Table";

function FrmActivityLogRpt() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;
  const DepartmentId = user?.deptId;
  const [userOptions, setUserOptions] = useState([]);
  const [activityLogData, setActivityLogData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15); // Set items per page to 15

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/getUsers`, {
          ulbId: UlbId,
          departmentId: DepartmentId,
        });

        if (response.data && Array.isArray(response.data.data)) {
          const options = [
            ...response.data.data.map((user) => ({
              value: user.USERID,
              label: user.USERNAME,
            })),
          ];
          setUserOptions(options);
        } else {
          setUserOptions([]);
          console.warn("Invalid user data format:", response.data);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setUserOptions([]);
      }
    };

    if (UlbId && DepartmentId) {
      fetchUsers();
    }
  }, [UlbId, DepartmentId]);

  const formatDate = (date) => {
    if (!date) return "";
    const localDate = new Date(date);
    if (isNaN(localDate.getTime())) {
      console.warn("Invalid date provided for formatting:", date);
      return "";
    }
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    setActivityLogData([]); // Clear previous data immediately
    setCurrentPage(1); // Reset to first page on new search

    try {
      const payload = {
        ulbId: UlbId,
        departmentId: DepartmentId,
        fromDate: formatDate(values.FromDate),
        toDate: formatDate(values.ToDate),
        userId: values.Username === "" ? "-1" : values.Username,
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${API_BASE_URL}/FrmActivityLogRpt`,
        payload
      );

      if (response.data && Array.isArray(response.data.data)) {
        setActivityLogData(response.data.data);
        if (response.data.data.length === 0) {
          setError(translate("No data found for the selected criteria."));
        }
      } else {
        setActivityLogData([]);
        console.warn("Invalid activity log report data format:", response.data);
        setError(translate("No data found for the selected criteria."));
      }
    } catch (err) {
      console.error("Error fetching activity log report:", err);
      setError(
        translate("Failed to fetch activity log report. Please try again.")
      );
      setActivityLogData([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activityLogData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(activityLogData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers for pagination controls
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  // --- End Pagination Logic ---

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("Activity Log Report")}
        />
        <hr />

        <Formik
          initialValues={{
            Username: "",
            FromDate: null,
            ToDate: null,
          }}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label
                    text={`${translate("From Date /दिनांक पासून")} :`}
                    required
                  />
                  <CalendarIcon
                    selectedDate={values.FromDate}
                    setSelectedDate={(date) => setFieldValue("FromDate", date)}
                    placeholder={translate("DD/MM/YYYY")}
                    autoSelectToday={false}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="FromDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label
                    text={`${translate("To Date /दिनांक पर्यंत")} :`}
                    required
                  />
                  <CalendarIcon
                    selectedDate={values.ToDate}
                    setSelectedDate={(date) => setFieldValue("ToDate", date)}
                    placeholder={translate("DD/MM/YYYY")}
                    className="form-control"
                    autoSelectToday={false}
                  />
                  <ErrorMessage
                    name="ToDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("Username / वापरकर्ता ")} :`} />
                  <Field
                    name="Username"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                    options={userOptions}
                  />
                  <ErrorMessage
                    name="Username"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-3 mt-4">
                <SaveButton type="submit" text={translate("प्रक्रिया")} />
                <SaveButton type="button" text={translate("बंद")} />
              </div>
            </Form>
          )}
        </Formik>

        {loading && (
          <p className="text-center mt-3">
            {translate("Loading activity log data...")}
          </p>
        )}
        {error && <p className="text-danger text-center mt-3">{error}</p>}

        {activityLogData.length > 0 && (
          <div className="table-responsive mt-4">
            <Table
              headers={[
                translate("Sr. No."),
                translate("User Id"),
                translate("Username"),
                translate("Date"),
                translate("Activity"),
                translate("Details"),
              ]}
              // Pass only the current items for display
              data={currentItems.map((logItem, index) => ({
                "Sr. No.": indexOfFirstItem + index + 1, // Corrected serial number for pagination
                "User Id": logItem.USERID,
                Username: logItem.USERNAME,
                Date: new Date(logItem.USERTIME).toLocaleDateString("en-GB"),
                Activity: logItem.ACTIVITY,
                Details: logItem.DETAILS,
              }))}
              keyMapping={{
                [translate("Sr. No.")]: "Sr. No.",
                [translate("User Id")]: "User Id",
                [translate("Username")]: "Username",
                [translate("Date")]: "Date",
                [translate("Activity")]: "Activity",
                [translate("Details")]: "Details",
              }}
            />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav aria-label="Page navigation" className="mt-3">
                <ul className="pagination justify-content-center">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      {translate("Previous")}
                    </button>
                  </li>
                  {pageNumbers.map((number) => (
                    <li
                      key={number}
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                    >
                      <button
                        onClick={() => paginate(number)}
                        className="page-link"
                      >
                        {number}
                      </button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      {translate("Next")}
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmActivityLogRpt;
