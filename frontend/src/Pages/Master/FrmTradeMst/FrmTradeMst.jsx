import React, { useEffect, useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import RadioButton from "../../../Components/RadioButton/RadioButton";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import useIP from "../../../Hooks/UseIp";
import config from "../../../utils/config";
import apiService from "../../../../apiService";

function FrmTradeMst() {
  const { translate } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orgId = user?.ulbId;
  const userId = user?.userId;
  const ipAddress = useIP();
  const tradeId = searchParams.get("tradeId");
  const [initialFormValues, setInitialFormValues] = useState({
    in_PageTitle: "",
    in_status: "Y",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTradeDetails = async () => {
      if (tradeId && orgId) {
        setLoading(true);
        setError(null);
        try {
          const response = await apiService.post(`FrmTradeMst`, {
            trade_id: parseInt(tradeId, 10),
            org_id: orgId,
          });

          if (response.data && response.data.data) { 
            const fetchedData = response.data.data;
            setInitialFormValues({
              in_PageTitle: fetchedData.TRADENAME || "",
              in_status: fetchedData.TRADEFLAG || "Y",
            });
          } else {
            setError(translate("No trade data found for this ID."));
            setInitialFormValues({
              in_PageTitle: "",
              in_status: "Y",
            });
          }
        } catch (err) {
          console.error("Error fetching trade details:", err);
          setError(
            translate("Failed to load trade details. Please try again.")
          );
          setInitialFormValues({
            in_PageTitle: "",
            in_status: "Y",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setInitialFormValues({
          in_PageTitle: "",
          in_status: "Y",
        });
      }
    };

    fetchTradeDetails();
  }, [tradeId, orgId, translate]);

  const validateForm = (values) => {
    const errors = {};

    if (!values.in_PageTitle.trim()) {
      errors.in_PageTitle = translate("Please Fill Trade Name");
      alert(translate("Please Fill Trade Name"));
    }

    if (!values.in_status) {
      errors.in_status = translate("Please select a status");
    }

    return errors;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    
    setSubmitting(true);
    setError(null);

    try {
      const inMode = tradeId ? 2 : 1;

      const payload = {
        In_Userid: userId,
        In_Mode: inMode,
        In_Tradeid: tradeId ? parseInt(tradeId, 10) : null,
        In_Tradename: values.in_PageTitle,
        In_Tradeflag: values.in_status,
        In_orgid: Number(orgId),
        in_ipaddr: ipAddress,
        in_source: config.source,
      };

      console.log("Submitting payload to Aomk_Trade_Ins:", payload);

      const response = await apiService.post(
        `Aomk_Trade_Ins`,
        payload
      );
      console.log("API Response from Aomk_Trade_Ins:", response.data);

      if (!response.data) {
        throw new Error(translate("API returned no data or failed decryption."));
      }

      if (response.data.errorCode === 9999) {
        let successMessage = "";
        if (inMode === 1) {
          successMessage = translate("Trade inserted successfully!");
        } else if (inMode === 2) {
          successMessage = translate("Trade updated successfully!");
        }
        alert(successMessage);
        navigate("/Masters/FrmTradeList.aspx");
      } else {
        
        const errorMessage =
          response.data.message ||
          translate("Failed to save trade due to a server-side error.");
        setError(errorMessage);
        alert(errorMessage);
      }
    } catch (error) {
    
      console.error("Error during trade submission:", error);
      const errorMessage =
        error.message ||
        translate("Failed to save trade. Please check your connection and try again.");
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/Masters/FrmTradeList.aspx");
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("व्यापार मास्टर")}
        />
        <hr />
        <Formik
          initialValues={initialFormValues}
          enableReinitialize={true}
          onSubmit={handleSubmit}
          validate={validateForm}
        >
          {() => (
            <Form className="container mt-4">
              {/* Trade Name */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("व्यापाराचे नांव")} :`} required />
                </div>
                <div className="col-md-5">
                  <Field name="in_PageTitle" component={InputField} />
                  <ErrorMessage
                    name="in_PageTitle"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>

              {/* Status Radio Buttons */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("स्थिती")} :`} required />
                </div>
                <div className="col-md-6 d-flex">
                  <Field
                    name="in_status"
                    component={RadioButton}
                    value="Y"
                    label={translate("सक्रीय")}
                    id="status-active"
                    className="radio-gap"
                  />
                  <Field
                    name="in_status"
                    component={RadioButton}
                    value="N"
                    label={translate("निष्क्रिय")}
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
                <SaveButton type="submit" text={translate("अद्यावत करा")} />
                <SaveButton
                  type="button"
                  text={translate("परत")}
                  onClick={handleBack}
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmTradeMst;