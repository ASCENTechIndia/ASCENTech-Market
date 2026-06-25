import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns"; // Import format from date-fns
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import Table from "../../../Components/Table/Table"; // Assuming this is your Table component path
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
import * as XLSX from "xlsx"; // Import xlsx library
import { saveAs } from "file-saver"; // Import saveAs from file-saver

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function FrmRejectApplicationReport() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;

  const [prabhagOptions, setPrabhagOptions] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]); // State for table data

  // Fetch Prabhag (Ward) names and IDs
  useEffect(() => {
    const fetchPrabhagOptions = async () => {
      if (!UlbId) {
        console.warn("UlbId not available. Cannot fetch ward names.");
        return;
      }
      try {
        const response = await axios.post(
          `${API_BASE_URL}/getWardNamesAndIdsByUlbId`,
          { ulbId: UlbId }
        );
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((ward) => ({
            value: ward.WARDID,
            label: ward.WARDNAME,
          }));
          setPrabhagOptions(options);
        } else {
          setPrabhagOptions([]);
          console.warn("Invalid ward names data:", response.data);
        }
      } catch (err) {
        console.error("Error fetching ward names:", err);
        setPrabhagOptions([]);
      }
    };
    fetchPrabhagOptions();
  }, [UlbId]);

  const handleSearch = async (values) => {
    console.log("Form submitted with values:", values);

    const formattedFromDate = values.FromDate
      ? format(new Date(values.FromDate), "dd-MM-yyyy")
      : "";
    const formattedToDate = values.ToDate
      ? format(new Date(values.ToDate), "dd-MM-yyyy")
      : "";

    const payload = {
      ulbId: UlbId,
      FromDt: formattedFromDate,
      ToDt: formattedToDate,
      wardId: values.Prabhag,
      shopName: values.ShopName,
      panCardNo: values.PanNo,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/getRejectedApplications`,
        payload
      );
      if (response.data && Array.isArray(response.data.data)) {
        setRejectedApplications(response.data.data);
      } else {
        setRejectedApplications([]);
        console.warn("Invalid rejected applications data:", response.data);
      }
    } catch (error) {
      console.error("Error fetching rejected applications:", error);
      setRejectedApplications([]);
      // Optionally, show an error message to the user
    }
  };

  const handleExportExcel = () => {
    if (rejectedApplications.length === 0) {
      alert("No data to export!");
      return;
    }

    // Prepare data for export
    const dataToExport = rejectedApplications.map((app, index) => ({
      "Sr No": index + 1,
      "Application Date": app.APPDT,
      "Application No": app.APPLINO,
      "Owner Name": app.OWNERNAME,
      "Shop Name": app.SHOPNAME,
      "Mobile No": app.CONTACTNO,
      Address: app.ADDRESS,
      "Rejected Date": app.REJECTDT,
      "Rejected Remark": app.REJECTEDREMARK,
    }));

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Create a workbook and add the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rejected Applications");

    // Generate a buffer
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Save the file
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Rejected_Applications_Report.xlsx");
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("नाकारलेल्या अर्जाचा अहवाल")}
        />
        <hr />

        <Formik
          initialValues={{
            Prabhag: "",
            ShopName: "",
            PanNo: "",
            FromDate: null,
            ToDate: null,
          }}
          onSubmit={handleSearch}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <Label text={`${translate("प्रभाग")} :`} required />
                    <Field
                      name="Prabhag"
                      component={InputField}
                      className="form-control"
                      type="dropdown"
                      options={prabhagOptions}
                      placeholder={translate("Select Prabhag")}
                    />
                    <ErrorMessage
                      name="Prabhag"
                      component="div"
                      className="text-danger"
                    />
                  </div>

                  <div className="col-md-4">
                    <Label text={`${translate("दुकानाचे नांव")} :`} required />
                    <Field
                      name="ShopName"
                      component={InputField}
                      className="form-control"
                    />
                    <ErrorMessage
                      name="ShopName"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                  <div className="col-md-4">
                    <Label text={`${translate("पॅन कार्ड क्र.")} :`} required />
                    <Field
                      name="PanNo"
                      component={InputField}
                      className="form-control"
                    />
                    <ErrorMessage
                      name="PanNo"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-4">
                    <Label text={`${translate("दिनांका पासून")} :`} required />
                    <CalendarIcon
                      selectedDate={values.FromDate}
                      setSelectedDate={(date) =>
                        setFieldValue("FromDate", date)
                      }
                      placeholder={translate("DD/MM/YYYY")}
                      autoSelectToday="true" // Keep as boolean false unless you specifically want today's date pre-selected
                      className="form-control"
                    />
                    <ErrorMessage
                      name="FromDate"
                      component="div"
                      className="text-danger"
                    />
                  </div>

                  <div className="col-md-4">
                    <Label text={`${translate("दिनांका पर्यंत")} :`} required />
                    <CalendarIcon
                      selectedDate={values.ToDate}
                      setSelectedDate={(date) => setFieldValue("ToDate", date)}
                      placeholder={translate("DD/MM/YYYY")}
                      className="form-control"
                      autoSelectToday="true"
                    />
                    <ErrorMessage
                      name="ToDate"
                      component="div"
                      className="text-danger"
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-4 mt-4">
                  <SaveButton type="submit" text={translate("शोधा")} />
                </div>
              </>
            </Form>
          )}
        </Formik>

        {/* Export Excel Button */}
        {rejectedApplications.length > 0 && (
          <div className="mt-4 text-start">
            {" "}
            {/* Added text-end for right alignment */}
            <button className="btn btn-success" onClick={handleExportExcel}>
              Export Excel
            </button>
          </div>
        )}

        {/* Table to display rejected applications */}
        {rejectedApplications.length > 0 && (
          <div className="table-container mt-4">
            <Table
              headers={[
                translate("Sr No"),
                translate("Application Date"),
                translate("Application No"),
                translate("Owner Name"),
                translate("Shop Name"),
                translate("Mobile No"),
                translate("Address"),
                translate("Rejected Date"),
                translate("Rejected Remark"),
              ]}
              data={rejectedApplications.map((app, index) => ({
                "Sr No": index + 1,
                "Application Date": app.APPDT, // Ensure this is already in "DD-MM-YYYY" format from API
                "Application No": app.APPLINO,
                "Owner Name": app.OWNERNAME,
                "Shop Name": app.SHOPNAME,
                "Mobile No": app.CONTACTNO,
                Address: app.ADDRESS,
                "Rejected Date": app.REJECTDT, // Ensure this is already in "DD-MM-YYYY" format from API
                "Rejected Remark": app.REJECTEDREMARK,
              }))}
              keyMapping={{
                [translate("Sr No")]: "Sr No",
                [translate("Application Date")]: "Application Date",
                [translate("Application No")]: "Application No",
                [translate("Owner Name")]: "Owner Name",
                [translate("Shop Name")]: "Shop Name",
                [translate("Mobile No")]: "Mobile No",
                [translate("Address")]: "Address",
                [translate("Rejected Date")]: "Rejected Date",
                [translate("Rejected Remark")]: "Rejected Remark",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmRejectApplicationReport;
