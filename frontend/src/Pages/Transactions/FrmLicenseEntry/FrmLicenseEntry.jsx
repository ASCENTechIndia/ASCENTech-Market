import React, { useState } from "react"; // Added useEffect for potential API calls
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { Nav, Tab, Container } from "react-bootstrap";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage, useFormikContext } from "formik";
import Label from "../../../Components/Label/Label"; // Adjust path as needed
import InputField from "../../../Components/InputField/InputField"; // Adjust path as needed
import CalendarIcon from "../../../Components/Calendar/CalendarIcon"; // Adjust path as needed
import SaveButton from "../../../Components/Buttons_save/Savebutton"; // Adjust path as needed
import Table from "../../../Components/Table/Table"; // Adjust path as needed
import LinkButton from "../../../Components/LinkButton/LinkButton"; // Adjust path as needed
import RadioButton from "../../../Components/RadioButton/RadioButton";
import FileUpload from "../../../Components/FileUpload/FileUpload";
import TransactionTable from "../../../Components/TransactionTable/TransactionTable";
// --- PrathmikMahitiTab Component Definition ---
const PrathmikMahitiTab = () => {
  const { translate } = useLanguage();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  return (
    <Formik enableReinitialize={true}>
      {({ setFieldValue, values, errors, touched }) => (
        <Form>
          {/* First Row: License No. & Old License No. */}
          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label
                text={`${translate(
                  "परवाना क्रमांक किंवा परवाना धारक किंवा नोंदणी क्रमांक"
                )} :`}
              />
              <Field
                name="licenseNo"
                component={InputField}
                className={`form-control ${
                  errors.licenseNo && touched.licenseNo ? "is-invalid" : ""
                }`}
                type="text"
              />
              <ErrorMessage
                name="licenseNo"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("दुकानाचे नाव इंग्रजी")} :`} />
              <Field
                name="EngShopName"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="EngShopName"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("दुकानाचे नाव मराठी")} :`} />
              <Field
                name="MarShopName"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="MarShopName"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label text={`${translate("पॅनकार्ड")} :`} required />
              <Field
                name="PanCard"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="PanCard"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("संपर्क क्र.")} :`} required />
              <Field
                name="ContactNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="ContactNo"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("ई-मेल")} :`} required />
              <Field
                name="Email"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="Email"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 ">
            <div className="col-md-4">
              <Label text={`${translate("दुकानाचा पत्ता")} :`} required />
              <Field
                name="ShopAddress"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="ShopAddress"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("वार्ड क्र.")} :`} required />
              <Field
                name="WardNo"
                component={InputField}
                className="form-control"
                type="dropdown"
              />
              <ErrorMessage
                name="WardNo"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("झोन क्र.")} :`} required />
              <Field
                name="ZoneNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="ZoneNo"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          {/* Sixth Row: From Date, To Date, Amount */}
          <div className="row mb-3">
            <div className="col-md-4">
              <Label text={`${translate("Arrears Amount")} :`} required />
              <Field
                name="ArrearsAmount"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="ArrearsAmount"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("दिनांक पासून")} :`} required />
              <CalendarIcon
                name="fromDate"
                selectedDate={fromDate}
                setSelectedDate={(date) => {
                  setFromDate(date);
                  setFieldValue("fromDate", date);
                }}
                placeholder="DD/MM/YYYY"
                autoSelectToday={false}
                className={`${
                  errors.fromDate && touched.fromDate ? "is-invalid" : ""
                }`}
              />
              <ErrorMessage
                name="fromDate"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("दिनांक पर्यंत")} :`} required />
              <CalendarIcon
                name="toDate"
                selectedDate={toDate}
                setSelectedDate={(date) => {
                  setToDate(date);
                  setFieldValue("toDate", date);
                }}
                placeholder="DD/MM/YYYY"
                autoSelectToday={false}
              />
              <ErrorMessage
                name="toDate"
                component="div"
                className="text-danger"
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col-md-4">
              <Label text={`${translate("रक्कम")} :`} required />
              <Field
                name="amount"
                component={InputField}
                type="number"
                placeholder={translate("रक्कम")}
              />
              <ErrorMessage
                name="amount"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="col-md-4">
              <Label text={`${translate("Trade Category ")} :`} required />
              <Field
                name="TradeCategory"
                component={InputField}
                className="form-control"
                type="dropdown"
              />
              <ErrorMessage
                name="TradeCategory"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("Trade Type")} :`} required />
              <Field
                name="TradeType"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="TradeType"
                component="div"
                className="text-danger"
              />
            </div>
          </div>
          <div className="row mb-3 align-items-end">
            {" "}
            {/* Added align-items-end to align items at the bottom */}
            <div className="col-md-4">
              <Label text={`${translate("Rate")} :`} required />
              <Field
                name="Rate"
                component={InputField}
                type="number"
                placeholder={translate("रक्कम")}
              />
              <ErrorMessage
                name="Rate"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              {" "}
              {/* New column for the button */}
              <SaveButton type="submit" text={translate("Add To List")} />{" "}
            </div>
          </div>

          {/* Submit and Back Buttons */}

          <div className="row mb-4">
            <div style={{ display: "flex", gap: "20px" }}>
              {/* Added a flex container with gap */}
              <div className="col-md-6">
                <div className="table-container mt-4">
                  <Table
                    headers={[
                      translate("निवडा"),
                      translate("व्यवसायाचे प्रकार"),
                    ]}
                    keyMapping={{
                      [translate("Select")]: "option",
                      [translate("Hospital Name")]: "HospitalName",
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="table-container mt-4">
                  <Table
                    headers={[
                      translate("काढा"),
                      translate("व्यवसायाचे स्वरूप"),
                      translate("दर"),
                    ]}
                    keyMapping={{
                      [translate("Select")]: "option",
                      [translate("Hospital Name")]: "HospitalName",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="row mb-3 align-items-center">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="col-md-5">
                  <Label text={`${translate("वस्तू निर्मित आहे का")} :`} />
                </div>
                <div className="d-flex gap-3 mt-1">
                  <Field
                    name="isItemManufactured"
                    component={RadioButton}
                    label={translate("होय")}
                    value="yes"
                    id="isItemManufacturedYes"
                  />
                  <Field
                    name="isItemManufactured"
                    component={RadioButton}
                    label={translate("नाही")}
                    value="no"
                    id="isItemManufacturedNo"
                  />
                </div>
              </div>
              <ErrorMessage
                name="isItemManufactured"
                component="div"
                className="text-danger"
              />
            </div>

            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="col-md-11">
                  <Label
                    text={`${translate(
                      "   स्वते चे: मालकीचे जागेत व्यवसाय करीत आहे का"
                    )} :`}
                  />
                </div>
                <div className="d-flex gap-3 mt-1">
                  <Field
                    name="isOwnBrandBusinessNo"
                    component={RadioButton}
                    label={translate("होय")}
                    value="yes"
                    id="isOwnBrandBusinessNo"
                  />
                  <Field
                    name="isOwnBrandBusinessNo"
                    component={RadioButton}
                    label={translate("नाही")}
                    value="no"
                    id="isOwnBrandBusinessNo"
                  />
                </div>
              </div>
              <ErrorMessage
                name="isOwnBrandBusiness"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label text={`${translate("जागा मालकाचे नाव")} :`} required />
              <Field
                name="OwnerName"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="OwnerName"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("जागा मालकाचा पत्ता")} :`} required />
              <Field
                name="OwnerAddress"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="OwnerAddress"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label
                text={`${translate("भाडे करार कोणासोबत केलेला आहे")} :`}
                required
              />
              <Field
                name="AggrementType"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="AggrementType"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label
                text={`${translate(
                  "वापरात असलेले जागेचे क्षेत्र चौ. फुट मध्ये"
                )} :`}
                required
              />
              <Field
                name="UsedArea"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="UsedArea"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label
                text={`${translate("व्यवसाय सुरु केल्याचे वर्ष")} :`}
                required
              />
              <Field
                name="YearOfCommencement"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="YearOfCommencement"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("शॉप ऍक्ट नोंदणी क्र.")} :`} required />
              <Field
                name="FormNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="FormNo"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-3">
                <div className="col-md-7">
                  <Label
                    text={`${translate(
                      "व्यवसायासाठी म. न. पा. चे नाहरकत प्रमाणपत्र घेतले आहे का"
                    )} :`}
                  />
                </div>
                <div className="d-flex gap-3 mt-1">
                  <Field
                    name="NoObjectionCertificate"
                    component={RadioButton}
                    label={translate("होय")}
                    value="yes"
                    id="NoObjectionCertificate"
                  />
                  <Field
                    name="NoObjectionCertificate"
                    component={RadioButton}
                    label={translate("नाही")}
                    value="no"
                    id="NoObjectionCertificate"
                  />
                </div>
              </div>
              <ErrorMessage
                name="NoObjectionCertificate"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label
                text={`${translate(
                  "अन्न व औषध प्रशासन कायद्यान्वये नोंदणी क्र."
                )} :`}
                required
              />
              <Field
                name="NondaniFormNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="NondaniFormNo"
                component="div"
                className="text-danger"
              />
            </div>
          </div>
          <hr />
          <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
            <SaveButton type="submit" text={translate("अर्ज जतन करा ")} />
            <SaveButton type="button" text={translate("बंद")} />
          </div>
        </Form>
      )}
    </Formik>
  );
};

const SanchalakMahitiTab = () => {
  const { translate } = useLanguage();
  // Added opening curly brace for the component body
  return (
    <Formik enableReinitialize={true}>
      {() => (
        <Form>
          {/* First Row: License No. & Old License No. */}
          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label
                text={`${translate("संचालकांचा आधार क्रमांक")} :`}
                required
              />
              <Field
                name="AAdharNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="AAdharNo"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("संचालकांचा नाव")} :`} required />
              <Field
                name="SanchalakName"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="SanchalakName"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label
                text={`${translate("Voter ID Card No / License No")} :`}
                required
              />
              <Field
                name="LicenseNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="LicenseNo"
                component="div"
                className="text-danger"
              />
            </div>
          </div>
          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label text={`${translate("संपर्क क्र.")} :`} required />
              <Field
                name="ContactNo"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="ContactNo"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("ई-मेल")} :`} required />
              <Field
                name="Email"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="Email"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="col-md-2 mt-4">
                  <Label text={`${translate("लिंग")} :`} />
                </div>
                <div className="d-flex gap-3 mt-4">
                  <Field
                    name="Female"
                    component={RadioButton}
                    label={translate("स्त्री")}
                    value="Female"
                    id="Female"
                  />
                  <Field
                    name="Male"
                    component={RadioButton}
                    label={translate("पुरुष")}
                    value="Male"
                    id="Male"
                  />
                  <Field
                    name="Other"
                    component={RadioButton}
                    label={translate("ईतर")}
                    value="Other"
                    id="Other"
                  />
                </div>
              </div>
              <ErrorMessage
                name="NoObjectionCertificate"
                component="div"
                className="text-danger"
              />
            </div>
          </div>

          <div className="row mb-3 mt-4">
            <div className="col-md-4">
              <Label text={`${translate("पत्ता")} :`} required />
              <Field
                name="Address"
                component={InputField}
                className="form-control"
                type="text"
              />
              <ErrorMessage
                name="Address"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("अर्जदार प्रकार")} :`} required />
              <Field
                name="ApplicantType"
                component={InputField}
                className="form-control"
                type="dropdown"
              />
              <ErrorMessage
                name="ApplicantType"
                component="div"
                className="text-danger"
              />
            </div>
            <div className="col-md-4">
              <Label text={`${translate("संचालकाचां फोटो")} :`} required />
              <FileUpload name="directorPhoto" />
              <ErrorMessage
                name="LicenseNo"
                component="div"
                className="text-danger"
              />
            </div>
          </div>
          <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
            <SaveButton type="submit" text={translate("Add Director")} />
          </div>

          <div className="table-container mt-4">
            <Table
              headers={[
                translate("आधार क्र."),
                translate("संचालकांचे नांव"),
                translate("Voter ID Card No / License No"),
                translate("मोबाईल क्र."),
                translate("ईमेल"),
                translate("लिंग"),
                translate("पत्ता"),
                translate("अर्जदाराचा प्रकार"),
                translate("संचालकांचे छायाचित्र"),
                translate("काडा"),
              ]}
              keyMapping={{
                [translate("Select")]: "option",
                [translate("Hospital Name")]: "HospitalName",
              }}
            />
          </div>
          <hr />
          <div className="d-flex justify-content-center flex-direction-row gap-4 mt-5">
            <SaveButton type="submit" text={translate("अर्ज जतन करा ")} />
            <SaveButton type="button" text={translate("बंद")} />
          </div>
        </Form>
      )}
    </Formik>
  ); // Added closing parenthesis and curly brace for the component's return and body
}; // Added closing curly brace for the component
const KagadpatraJodaneTab = () => {
  const { translate } = useLanguage();

  return (
    <div>
      <div className="table-container mt-4">
        <TransactionTable
          headers={[
            translate("दस्ताऐवजाचे नाव"),
            translate("शेरा"),
            translate("फाईल निवडा"),
          ]}
          keyMapping={{
            [translate("दस्ताऐवजाचे नाव")]: "docName",
            [translate("शेरा")]: "comment",
            [translate("फाईल निवडा")]: "file", // This key is handled by renderCell
          }}
          renderCell={{
            [translate("शेरा")]: (row, rowIndex) => (
              <input
                type="text"
                className="form-control" // Add Bootstrap class for styling
                value={row.comment}
              />
            ),
            [translate("फाईल निवडा")]: (row, rowIndex) => (
              <input
                type="file"
                className="form-control" // Add Bootstrap class for styling
              />
            ),
          }}
        />
      </div>
    </div>
  );
};

const ArrearsUpdateTab = () => (
  <div>
    {/* Your arrears update fields */}
    <p>This is the content for Arrears Update.</p>
  </div>
);
// --- End of Tab Content Components ---

function FrmLicenseEntry() {
  const { translate } = useLanguage();
  const [key, setKey] = useState("prathmikMahiti"); // State to control active tab

  return (
    <div>
      <Header />
      <Navbar />
      <Container className="mt-4">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("परवाना प्रवेश")}
        />
        <hr />
        <Tab.Container
          id="license-entry-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k)}
        >
          <Nav variant="tabs">
            <Nav.Item>
              <Nav.Link eventKey="prathmikMahiti">
                {translate("प्राथमिक माहिती")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="sanchalakMahiti">
                {translate("संचालक माहिती")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="kagadpatraJodane">
                {translate("कागदपत्र जोडणे")}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="arrearsUpdate">Arrears Update</Nav.Link>
            </Nav.Item>
          </Nav>
          <Tab.Content className="mt-3">
            <Tab.Pane eventKey="prathmikMahiti">
              <PrathmikMahitiTab /> {/* Renders the detailed form here */}
            </Tab.Pane>
            <Tab.Pane eventKey="sanchalakMahiti">
              <SanchalakMahitiTab />
            </Tab.Pane>
            <Tab.Pane eventKey="kagadpatraJodane">
              <KagadpatraJodaneTab />
            </Tab.Pane>
            <Tab.Pane eventKey="arrearsUpdate">
              <ArrearsUpdateTab />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </div>
  );
}

export default FrmLicenseEntry;
