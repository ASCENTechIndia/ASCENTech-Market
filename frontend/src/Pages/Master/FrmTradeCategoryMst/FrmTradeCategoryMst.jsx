import React, { useEffect, useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import useIP from "../../../Hooks/UseIp";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import { useSearchParams, useNavigate } from "react-router-dom"; 
import { useAuth } from "../../../Context/AuthContext"; 
import apiService from "../../../../apiService";
import config from "../../../utils/config";

function FrmTradeCategoryMst() {
  const { translate } = useLanguage();
  const { user } = useAuth(); 
  const orgId = user?.ulbId;
  const userId = user?.userId; 
  const ipAddress = useIP();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); 
  const tradeCategoryId = searchParams.get("tradeCategoryId");

  const [initialValues, setInitialValues] = useState({
    TradeCategoryName: "",
    in_status: "Y", 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTradeCategoryData = async () => {
      if (tradeCategoryId && orgId) {
        setLoading(true);
        try {
          const response = await apiService.post(
            `FrmTradeCategoryMst`, 
            {
              TradeCategoryId: tradeCategoryId,
              OrgId: orgId,
            }
          );

          if (
            response.data &&
            response.data.errorCode === 9999 &&
            response.data.data
          ) {
            const data = response.data.data;
            setInitialValues({
              TradeCategoryName: data.VAR_TRADECATEGORY_NAME || "",
              in_status: data.VAR_TRADECATEGORY_FLAG || "Y", 
            });
          } else {
            alert(
              translate(
                response.data.message ||
                  "No data found for this Trade Category ID."
              )
            );
            setInitialValues({
              TradeCategoryName: "",
              in_status: "Y",
            }); 
          }
        } catch (err) {
          console.error("Error fetching trade category data:", err);
          alert(translate("Failed to load trade category details."));
          setInitialValues({
            TradeCategoryName: "",
            in_status: "Y",
          }); 
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false); 
       
      }
    };

    fetchTradeCategoryData();
  }, [tradeCategoryId, orgId, translate]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);

    const mode = tradeCategoryId ? 2 : 1; 

    const payload = {
      In_Userid: userId, 
      In_Mode: mode,
      In_TradeCategoryid: tradeCategoryId ? Number(tradeCategoryId) : null,
      In_TradeCategoryname: values.TradeCategoryName,
      In_TradeCategoryflag: values.in_status,
      In_orgid: Number(orgId), 
      In_Code: null, 
      in_ipaddr: ipAddress,
      in_source: config.source, 
    };

    console.log("Submitting payload:", payload);

    try {
      const response = await apiService.post(
        "Aomk_TradeCategory_Ins", 
        payload
      );

      if (response.data && response.data.ErrorCode === 9999) {
        const successMessage =
          mode === 1
            ? "Trade Category Inserted Successfully!"
            : "Trade Category Updated Successfully!";
        alert(successMessage);
        resetForm();
        navigate("/Masters/FrmTradeCategoryList.aspx");
      } else {
        alert(response.data.Message || "Failed to save trade category.");
      }
    } catch (err) {
      console.error("Error submitting trade category:", err);
      alert("Failed to submit. Check server or network.");
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
          text={translate("Trade Category Master")}
        />
        <hr />
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ values, isSubmitting }) => (
            <Form className="container mt-4">
              {/* Trade Name */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-3">
                  <Label
                    text={`${translate("Trade Category Name")} :`}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <Field name="TradeCategoryName" component={InputField} />
                  <ErrorMessage
                    name="TradeCategoryName"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

            
              <div className="row mb-3 align-items-center">
                <div className="col-md-3">
                  <Label text={`${translate("स्थिती")} :`} required />
                </div>
                <div className="col-md-6 d-flex radio-gap-container">
                  <Field
                    name="in_status" 
                    component={RadioButton}
                    value="Y"
                    label={translate("Active")}
                    id="status-active"
                  />
                  <Field
                    name="in_status" 
                    component={RadioButton}
                    value="N"
                    label={translate("InActive")}
                    id="status-inactive"
                  />
                  <ErrorMessage
                    name="in_status"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center gap-4 mt-4">
                <SaveButton type="submit" text={translate("साठवा")} />
                <SaveButton
                  type="button"
                  text={translate("परत")}
                  onClick={() => navigate("/Masters/FrmTradeCategoryList.aspx")} // Navigate back to the list
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmTradeCategoryMst;
