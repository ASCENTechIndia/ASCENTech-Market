import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import InputField from "../../../Components/InputField/InputField";
import Label from "../../../Components/Label/Label";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import { useLanguage } from "../../../Context/LanguageProvider";
import { useAuth } from "../../../Context/AuthContext";
// import { ValidationSchemas } from "../../../HOC/Validation/Validation";
import apiService from "../../../../apiService";

function FrmBillGeneration() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const formikRef = useRef();

  const UlbId = user?.ulbId;
  const userId = user?.userId;

  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [challanDate, setChallanDate] = useState(null);

  const [wards, setWards] = useState([]);

  // const validationSchema =
  //   ValidationSchemas(translate).FrmGeneralReceiptChallanGen;

  const initialValues = {
    WardNo: "",
    ChallanDate: "",
    FromDate: "",
    ToDate: "",
    PaymentMode: "",
    isItemManufactured: "yes",
    licenseNo: "",
  };

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Fetch Payment Modes and Wards
  useEffect(() => {
    if (UlbId) {
      const fetchData = async () => {
        try {
          const wardsResponse = await apiService.post(
            "getWardNamesAndIdsByUlbId",
            { ulbId: UlbId }
          );
          if (Array.isArray(wardsResponse.data?.data)) {
            setWards(
              wardsResponse.data.data.map((ward) => ({
                label: ward.WARDNAME,
                value: ward.WARDID,
              }))
            );
          }
        } catch (err) {
          console.error("Error fetching data:", err);
        }
      };
      fetchData();
    }
  }, [UlbId]);

  const handleSubmit = async (values, { setSubmitting }) => {
  try {
    debugger;
    // Convert Formik date values to proper format (yyyy-MM-dd)
    const formatAPIDate = (dateObj) => {
      if (!dateObj) return null;
      const date = new Date(dateObj);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Convert all date values
    const fromDate = new Date(values.FromDate);
    const toDate = new Date(values.ToDate);

    // Date validations same as .NET logic
    if (fromDate > toDate) {
      alert("From Date cannot be greater than To Date");
      setSubmitting(false);
      return;
    }

    const fromDay = fromDate.getDate();
    const fromMonth = fromDate.getMonth() + 1;
    if (fromDay !== 1 || fromMonth !== 4) {
      alert("From date should be 1st April");
      setSubmitting(false);
      return;
    }

    const toDay = toDate.getDate();
    const toMonth = toDate.getMonth() + 1;
    if (toDay !== 31 || toMonth !== 3) {
      alert("To date should be 31st March");
      setSubmitting(false);
      return;
    }

    // Payload as per .NET logic
    const payload = {
      In_UserId: userId, 
      In_BillNo: null,
      // In_BillDate: formatAPIDate(values.ChallanDate),
      In_DueDate: formatAPIDate(values.ChallanDate), 
      In_licenceNo:
        values.isItemManufactured === "yes" ? null : values.licenseNo || null,
      In_FromDate: formatAPIDate(values.FromDate),
      In_ToDate: formatAPIDate(values.ToDate),
      In_WardID: Number(values.WardNo) || 0,
      In_TYPE: values.isItemManufactured === "yes" ? "ALL" : "R", 
      In_ULBID: Number(UlbId),
      In_RECEIPTNO: null, 
      In_ARREARS: 0,
      In_CURRENT: 0,
      In_EntryType: "N",
    };

    console.log("📤 Bill Generation Payload:", payload);

    const response = await apiService.post("aomk_Bill_Ins", payload);

    if (response.data?.success) {
      alert(`✅ ${response.data?.message}`);
    } else {
      alert(response.data?.message || "Bill generation failed.");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert(error.response?.data?.message || "Error while generating bill.");
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
          text={translate("General Receipt Challan Generation")}
        />
        <hr />

        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form>
              {/* Ward Selection */}
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("वार्ड क्र.")} :`} required />
                  <Field
                    name="WardNo"
                    component={InputField}
                    type="dropdown"
                    options={wards}
                  />
                  <ErrorMessage
                    name="WardNo"
                    component="div"
                    className="text-danger"
                  />
                </div>

                {/* License / Radio Buttons */}
                <div className="col-md-4">
                  <Label text={`${translate("परवाना क्र.")} :`} />
                  <div className="d-flex gap-3 mt-1">
                    <Field
                      name="isItemManufactured"
                      component={RadioButton}
                      label={translate("सर्व")}
                      value="yes"
                      id="isItemManufacturedYes"
                      onChange={(e) => {
                        setFieldValue("isItemManufactured", e.target.value);
                        setFieldValue("licenseNo", "");
                      }}
                    />
                    <Field
                      name="isItemManufactured"
                      component={RadioButton}
                      label={translate("एक")}
                      value="no"
                      id="isItemManufacturedNo"
                      onChange={(e) =>
                        setFieldValue("isItemManufactured", e.target.value)
                      }
                    />

                    {values.isItemManufactured === "no" && (
                      <Field
                        name="licenseNo"
                        component={InputField}
                        className="form-control"
                        type="text"
                      />
                    )}
                  </div>
                  <ErrorMessage
                    name="isItemManufactured"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-md-4">
                  <Label text={`${translate("दिनांका पासून")} :`} required />
                  <CalendarIcon
                    name="FromDate"
                    selectedDate={fromDate}
                    setSelectedDate={(date) => {
                      setFromDate(date);
                      setFieldValue("FromDate", date);
                    }}
                    placeholder="DD/MM/YYYY"
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
                    name="ToDate"
                    selectedDate={toDate}
                    setSelectedDate={(date) => {
                      setToDate(date);
                      setFieldValue("ToDate", date);
                    }}
                    placeholder="DD/MM/YYYY"
                  />
                  <ErrorMessage
                    name="ToDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("Due Date")} :`} required />
                  <CalendarIcon
                    name="ChallanDate"
                    selectedDate={challanDate}
                    setSelectedDate={(date) => {
                      setChallanDate(date);
                      setFieldValue("ChallanDate", date);
                    }}
                    placeholder="DD/MM/YYYY"
                  />
                  <ErrorMessage
                    name="ChallanDate"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="d-flex justify-content-center gap-4 mt-5">
                <SaveButton type="submit" text={translate("Submit")} />
                <SaveButton
                  type="button"
                  text={translate("Back")}
                  onClick={() => navigate("/HomePage/Dashboard.aspx")}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmBillGeneration;
