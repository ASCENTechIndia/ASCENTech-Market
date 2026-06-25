import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { format, parse } from "date-fns";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import CalendarIcon from "../../../Components/Calendar/CalendarIcon";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import { useLanguage } from "../../../Context/LanguageProvider";
import { useAuth } from "../../../Context/AuthContext";
import useIP from "../../../Hooks/UseIp";
import config from "../../../utils/config";
import { useSearchParams, useNavigate } from "react-router-dom";
import apiService from "../../../../apiService";

function FrmTradeTypeMst() {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const ipAddress = useIP();
  const ulbId = user?.ulbId;
  const tradeTypeId = searchParams.get("tradeTypeId");

  const [categories, setCategories] = useState([]);
  const [initialValues, setInitialValues] = useState({
    TradeTypeCategory: "",
    BussinessTypeName: "",
    in_status: "Y",
    FromDate: null,
    ToDate: null,
    Rate: "",
  });
  const [categoryError, setCategoryError] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gridError, setGridError] = useState("");

  // ✅ Fetch Trade Categories
  useEffect(() => {
    const fetchTradeCategories = async () => {
      if (!ulbId) return;
      setCategoryError(null);
      try {
        const response = await apiService.post(`TradeCategory`, {
          org_id: ulbId,
        });
        if (response.data && Array.isArray(response.data.data)) {
          const categories = response.data.data.map((item) => ({
            value: item.TRADECATEGORYID,
            label: item.TRADECATEGORYNAME,
          }));
          setCategories(categories);
        } else setCategories([]);
      } catch (err) {
        setCategoryError(translate("Failed to load trade categories."));
      }
    };
    fetchTradeCategories();
  }, [ulbId]);

  // ✅ Fetch Trade Type Details & Rates
  useEffect(() => {
    if (!ulbId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const detailsReq = apiService.post(`BindTradeTypeDetails`, {
      tradeTypeId,
      orgId: ulbId,
    });
    const ratesReq = apiService.post(`getTradeTypeRates`, {
      tradeTypeId,
      orgId: ulbId,
    });

    Promise.all([detailsReq, ratesReq])
      .then(([detRes, rateRes]) => {
        const d = detRes.data.data || {};
        setInitialValues({
          TradeTypeCategory: d.TRADECATEGORYID?.toString() || "",
          BussinessTypeName: d.TRADETYPENAME || "",
          in_status: d.TRADETYPEFLAG || "Y",
          FromDate: d.DTFROM ? new Date(d.DTFROM) : null,
          ToDate: d.DTTO ? new Date(d.DTTO) : null,
          Rate: "",
        });

        const rows = Array.isArray(rateRes.data.data)
          ? rateRes.data.data.map((r, i) => ({
              TRADETYPE: r.TRADETYPE,
              DTFROM: r.DTFROM ? format(new Date(r.DTFROM), "yyyy-MM-dd") : "",
              DTTO: r.DTTO ? format(new Date(r.DTTO), "yyyy-MM-dd") : "",
              RATE: r.RATE,
              key: i,
            }))
          : [];
        setTableRows(rows);
      })
      .catch((err) => console.warn("Data fetch error:", err))
      .finally(() => setLoading(false));
  }, [ulbId, tradeTypeId]);

  // ✅ Handle Form Submission
  const handleSubmit = async (vals, { resetForm }) => {
    setGridError("");

    if (tableRows.length === 0) {
      alert(translate("Please add at least one rate entry to the grid."));
      return;
    }

    if (!vals.TradeTypeCategory) {
      alert(translate("Please select a Trade Type Category."));
      return;
    }

    const In_TradeRateStr = tableRows
      .map((row) => {
        const fromDateParsed = parse(row.DTFROM, "yyyy-MM-dd", new Date());
        const toDateParsed = parse(row.DTTO, "yyyy-MM-dd", new Date());
        const formattedFromDate = format(
          fromDateParsed,
          "dd-MMM-yyyy"
        ).toUpperCase();
        const formattedToDate = format(
          toDateParsed,
          "dd-MMM-yyyy"
        ).toUpperCase();
        return `${formattedFromDate}$${formattedToDate}$${row.RATE}$${row.TRADETYPE}`;
      })
      .join("#");

    const In_Mode = tradeTypeId ? 2 : 1;
    const submissionMessage =
      In_Mode === 1
        ? translate("Trade Type Inserted Successfully!")
        : translate("Trade Type Updated Successfully!");

    // ✅ Generate payload exactly as backend expects
    debugger;
    const payload = {
      In_Userid: user?.userId,
      In_Mode,
      In_Tradetypeid: Number(tradeTypeId) || null,
      In_Tradetypename: vals.BussinessTypeName,
      In_Tradetypeflag: vals.in_status,
      In_TradeRateStr,
      In_orgid: Number(ulbId),
      In_TradetypeCategoryid: Number(vals.TradeTypeCategory),
      in_ipaddr: ipAddress,
      in_source: config.source,
      in_code: `${vals.BussinessTypeName.replace(/\s+/g, "")
        .toUpperCase()
        .slice(0, 3)}${new Date().getFullYear()}`,
    };

    console.log("Submitting payload:", payload);

    try {
      const response = await apiService.post(`Aomk_TradeType_Ins`, payload);
      console.log("API Response:", response.data);

      if (response.data && response.data.errorcode === 9999) {
        alert(submissionMessage);
        resetForm();
        setTableRows([]);
        navigate("/Masters/FrmTradeTypeList.aspx");
      } else {
        alert(
          translate(
            response.data.errormsg || "Failed to save data. Please try again."
          )
        );
      }
    } catch (error) {
      console.error("API Submission Error:", error);
      alert(
        translate(
          "An error occurred during submission. Please check console for details."
        )
      );
    }
  };

  // ✅ Add to Grid
  const handleAddtoGrid = (values, setFieldValue) => {
    if (
      !values.FromDate ||
      !values.ToDate ||
      !values.Rate ||
      !values.BussinessTypeName
    ) {
      if (!values.Rate) alert(translate("Please enter the Rate."));
      else
        alert(
          translate(
            "Please fill in all fields (From Date, To Date, Business Type Name) before adding to grid."
          )
        );
      return;
    }

    const newRow = {
      TRADETYPE: values.BussinessTypeName,
      DTFROM: format(values.FromDate, "yyyy-MM-dd"),
      DTTO: format(values.ToDate, "yyyy-MM-dd"),
      RATE: values.Rate,
      key: tableRows.length,
    };

    setTableRows((prevRows) => [...prevRows, newRow]);
    setGridError("");
    setFieldValue("FromDate", null);
    setFieldValue("ToDate", null);
    setFieldValue("Rate", "");
  };

  // ✅ Delete last row
  const handleDeleteLastRow = () => {
    setTableRows((prevRows) => {
      if (prevRows.length === 0) {
        setGridError(translate("No rows to delete."));
        return prevRows;
      }
      setGridError("");
      return prevRows.slice(0, -1);
    });
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          text={translate("व्यापार प्रकार मास्टर")}
          className="headerlabel mt-4"
        />
        <hr />

        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="row mb-3">
                <div className="col-md-4">
                  <Label
                    text={`${translate("Trade Type Category")} :`}
                    required
                  />
                  <Field
                    name="TradeTypeCategory"
                    component={InputField}
                    type="dropdown"
                    options={categories}
                  />
                  <ErrorMessage
                    name="TradeTypeCategory"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label
                    text={`${translate("व्यापार प्रकारचे नांव")} :`}
                    required
                  />
                  <Field
                    name="BussinessTypeName"
                    component={InputField}
                    className="form-control"
                  />
                  <ErrorMessage
                    name="BussinessTypeName"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("स्थिती")} :`} required />
                  <div className="radio-gap">
                    <Field
                      name="in_status"
                      component={RadioButton}
                      value="Y"
                      label={translate("सक्रीय")}
                    />
                    <Field
                      name="in_status"
                      component={RadioButton}
                      value="N"
                      label={translate("निष्क्रिय")}
                    />
                  </div>
                  <ErrorMessage
                    name="in_status"
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
                    setSelectedDate={(d) => setFieldValue("FromDate", d)}
                    placeholder="DD/MM/YYYY"
                    autoSelectToday={true}
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
                    setSelectedDate={(d) => setFieldValue("ToDate", d)}
                    placeholder="DD/MM/YYYY"
                    autoSelectToday={true}
                  />
                  <ErrorMessage
                    name="ToDate"
                    component="div"
                    className="text-danger"
                  />
                </div>

                <div className="col-md-4">
                  <Label text={`${translate("दर")} :`} required />
                  <Field
                    name="Rate"
                    component={InputField}
                    type="number"
                    className="form-control"
                  />
                  <ErrorMessage
                    name="Rate"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              {gridError && (
                <div className="alert alert-danger" role="alert">
                  {gridError}
                </div>
              )}

              <div className="d-flex justify-content-start gap-4 mt-4">
                <SaveButton
                  type="button"
                  text={translate("Add to Grid")}
                  onClick={() => handleAddtoGrid(values, setFieldValue)}
                />
              </div>

              <div className="table-container mt-4">
                <Table
                  headers={[
                    translate("व्यापाराचे प्रकार"),
                    translate("दिनांका पासून"),
                    translate("दिनांका पर्यंत"),
                    translate("दर"),
                  ]}
                  data={tableRows.map((r) => ({
                    "व्यापाराचे प्रकार": r.TRADETYPE,
                    "दिनांका पासून": r.DTFROM,
                    "दिनांका पर्यंत": r.DTTO,
                    दर: r.RATE,
                  }))}
                  keyMapping={{
                    [translate("व्यापाराचे प्रकार")]: "व्यापाराचे प्रकार",
                    [translate("दिनांका पासून")]: "दिनांका पासून",
                    [translate("दिनांका पर्यंत")]: "दिनांका पर्यंत",
                    [translate("दर")]: "दर",
                  }}
                />
              </div>

              <div className="d-flex justify-content-start gap-4 mt-2">
                <LinkButton
                  text={translate("Delete Last Row")}
                  onClick={handleDeleteLastRow}
                />
              </div>

              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton type="submit" text={translate("अद्यावत करा")} />
                <SaveButton
                  type="button"
                  text={translate("परत")}
                  onClick={() => navigate("/Masters/FrmTradeTypeList.aspx")}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmTradeTypeMst;
