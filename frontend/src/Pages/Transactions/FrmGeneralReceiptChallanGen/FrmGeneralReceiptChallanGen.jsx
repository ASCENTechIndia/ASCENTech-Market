import React, { useState, useEffect } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import { useNavigate } from "react-router-dom";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { useAuth } from "../../../Context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Label from "../../../Components/Label/Label";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import { ValidationSchemas } from "../../../HOC/Validation/Validation";
import apiService from "../../../../apiService"; 

function FrmGeneralReceiptChallanGen() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const UlbId = user?.ulbId;
  const userId = user?.userId;
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(null);
  const [ToDate, setToDate] = useState(null);
  const [ChallanDate, setChallanDate] = useState(null);
  const [paymentModes, setPaymentModes] = useState([]);
  const [wards, setWards] = useState([]);

  const validationSchema =
    ValidationSchemas(translate).FrmGeneralReceiptChallanGen;

  const formatDate = (dateObj) => {
    if (!dateObj) return "";
    const date = new Date(dateObj);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [initialValues, setInitialValues] = useState({
    ChallanDate: "",
    FromDate: "",
    ToDate: null,
    Prabhag: "",
    PaymentMode: "",
  });

  // Fetch Payment Modes and Wards
  useEffect(() => {
    if (UlbId) {
      const fetchData = async () => {
        try {
          const paymentModesResponse = await apiService.post("getRecModeConfig", { ulbId: UlbId });
          if (Array.isArray(paymentModesResponse.data?.data)) {
            setPaymentModes(
              paymentModesResponse.data.data.map((mode) => ({
                label: mode.RECMODENAME,
                value: mode.RECMODEID,
              }))
            );
          }

          const wardsResponse = await apiService.post("getWardNamesAndIdsByUlbId", { ulbId: UlbId });
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
    debugger;
    try {
      const payload = {
        username: userId,
        chalanDate: formatDate(values.ChallanDate),
        receiptFromDate: formatDate(values.FromDate),
        receiptToDate: formatDate(values.ToDate),
        prabhagId: Number(values.Prabhag),
        payMode: Number(values.PaymentMode),
        orgId: Number(UlbId),
      };

      const response = await apiService.post(
        "aomk_genrct_chalannumber_gen",
        payload
      );

      const result = response.data || response;

      if (result.success) {
        alert("Challan generated successfully!");
      } else {
        alert(`${result.message || "Challan generation failed."}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };
  // -------------------------------------------------------------

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
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit} // <-- use separated handleSubmit
        >
          {({ setFieldValue }) => (
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-md-4">
                  <Label text={`${translate("Challan Date")} :`} required />
                  <CalendarIcon
                    name="ChallanDate"
                    selectedDate={ChallanDate}
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

                <div className="col-md-4">
                  <Label text={`${translate("From Date")} :`} required />
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
                  <Label text={`${translate("To Date")} :`} required />
                  <CalendarIcon
                    name="ToDate"
                    selectedDate={ToDate}
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
              </div>

              <div className="row mb-3">
                <div className="col-md-4">
                  <Label text={`${translate("Prabhag")} :`} required />
                  <Field
                    name="Prabhag"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                    options={wards}
                  />
                  <ErrorMessage
                    name="Prabhag"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("Payment Mode")} :`} required />
                  <Field
                    name="PaymentMode"
                    component={InputField}
                    className="form-control"
                    type="dropdown"
                    options={paymentModes}
                  />
                  <ErrorMessage
                    name="PaymentMode"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
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

export default FrmGeneralReceiptChallanGen;
