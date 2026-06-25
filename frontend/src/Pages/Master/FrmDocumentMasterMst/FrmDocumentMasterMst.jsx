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
import config from "../../../utils/config";
import useIP from "../../../Hooks/UseIp";
import apiService from "../../../../apiService"

function FrmDocumentMasterMst() {
  const { translate } = useLanguage();
  const { user } = useAuth();
  const userId = user?.userId;
  const ulbId = user?.ulbId;
  const ipAddress = useIP();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const documentId = searchParams.get("documentId");

  const [initialValues, setInitialValues] = useState({
    DocumentName: "",
    in_status: "Y",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocumentData = async () => {
      if (documentId && ulbId) {
        setLoading(true);
        try {
          const response = await apiService.post(
            `BindDocumentDetails`,
            {
              documentId: documentId,
              orgId: ulbId,
            }
          );

          if (response.data && response.data.data) {
            const data = response.data.data;
            setInitialValues({
              DocumentName: data.DOCUMENTNAME || "",
              in_status: data.DOCUMENTFLAG || "Y",
            });
          } else {
            alert("No data found for this Document ID.");
            setInitialValues({
              DocumentName: "",
              in_status: "Y",
            });
          }
        } catch (err) {
          console.error("Error fetching document data:", err);
          alert("Failed to load document details."); 
          setInitialValues({
            DocumentName: "",
            in_status: "Y",
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchDocumentData();
  }, [documentId, ulbId]); 

const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  setSubmitting(true);

  
  const docId = documentId ? Number(documentId) : null;
  const mode = docId ? 2 : 1; 

  const payload = {
    In_Userid: userId,
    In_Mode: mode,
    In_DocId: docId,
    In_Docname: values.DocumentName,
    In_Docflag: values.in_status,
    In_orgid: Number(ulbId),
    in_ipaddr: ipAddress,
    in_source: config.source,
  };

  console.log("Submitting payload:", payload);

  try {
    const response = await apiService.post(`Aomk_Doc_Ins`, payload);

    if (response.data && response.data.errorcode === 9999) {
      const successMessage =
        mode === 1
          ? translate(response.data.errormsg || "Document Name Inserted Successfully!")
          : translate(response.data.errormsg || "Document Name Updated Successfully!");
      
      alert(successMessage);

      if (mode === 1) {
        resetForm(); // Only reset for new insert
      }

      navigate("/Masters/FrmDocumentMasterList.aspx");
    } else {
      alert(
        translate(response.data?.errormsg || "Failed to save document. Please try again.")
      );
    }
  } catch (err) {
    console.error("Error saving document:", err);
    alert(translate("An error occurred while saving. Please try again."));
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
          text={translate("दस्तऐवज मास्टर")}
        />
        <hr />
        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          onSubmit={handleSubmit} // Assign the handleSubmit function here
        >
          {({ values, isSubmitting }) => (
            <Form className="container mt-4">
              {/* Document Name */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("दस्तऐवजचे नांव")} :`} required />
                </div>
                <div className="col-md-5">
                  <Field name="DocumentName" component={InputField} />
                  <ErrorMessage
                    name="DocumentName"
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
                <div className="col-md-6 d-flex radio-gap-container">
                  <Field
                    name="in_status"
                    component={RadioButton}
                    value="Y"
                    label={translate("सक्रीय")}
                    id="status-active"
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
                <SaveButton
                  type="submit"
                  text={translate("अद्यावत करा")}
                  disabled={isSubmitting}
                />
                <SaveButton
                  type="button"
                  text={translate("परत")}
                  onClick={() =>
                    navigate("/Masters/FrmDocumentMasterList.aspx")
                  }
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmDocumentMasterMst;
