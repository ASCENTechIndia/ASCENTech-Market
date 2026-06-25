import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useAuth } from "../../../Context/AuthContext";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import apiService from "../../../../apiService";
import { useNavigate } from "react-router-dom";


function FrmTradeTypeList() {
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const [tradeTypeList, setTradeTypeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input

  useEffect(() => {
    const fetchTradeTypeList = async () => {
      if (!ulbId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await apiService.post(`FrmTradeTypeList`, {
          org_id: ulbId,
        });

        if (response.data && Array.isArray(response.data.data)) {
          setTradeTypeList(response.data.data);
        } else {
          setTradeTypeList([]);
          console.warn(
            "API response data for trade types is not an array or empty:",
            response.data
          );
        }
      } catch (err) {
        console.error("Error fetching trade type list:", err);
        setError(
          translate("Failed to load trade type list. Please try again.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTradeTypeList();
  }, [ulbId, translate]);

  // Memoize filtered list for search functionality
  const filteredTradeTypeList = useMemo(() => {
    if (!searchTerm) {
      return tradeTypeList;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();

    return tradeTypeList.filter(
      (trade) =>
        (trade.TRADETYPENAME &&
          trade.TRADETYPENAME.toLowerCase().includes(lowercasedSearchTerm)) ||
        (trade.TRADETYPEFLAG &&
          trade.TRADETYPEFLAG.toLowerCase().includes(lowercasedSearchTerm))
    );
  }, [tradeTypeList, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const initialValues = {
    search: "",
  };

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("व्यापार प्रकार मास्टर यादी")}
        />
        <hr />

        <Formik initialValues={initialValues}>
          {() => (
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-12 col-sm-6 col-md-2 d-flex justify-content-center justify-content-md-start">
                  <SaveButton
                    type="button"
                    text={translate("Add New")}
                    onClick={() => navigate("/Masters/FrmTradeTypeMst.aspx")}
                  />
                </div>
                <div className="col-md-1">
                  <Label text={`${translate("शोधा")} :`} />
                </div>
                <div className="col-md-4">
                  <Field
                    name="search"
                    component={InputField}
                    className="form-control"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <ErrorMessage
                    name="search"
                    component="div"
                    className="text-danger"
                  />
                </div>
              </div>
              <hr />
            </Form>
          )}
        </Formik>

        {loading ? (
          <p>{translate("Loading trade types...")}</p>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : filteredTradeTypeList.length > 0 ? (
          <div className="table-container mt-4 w-50">
            <Table
              headers={[
                translate("Select"),
                translate("व्यापार प्रकार नांव"),
                translate("स्थिती"),
              ]}
              data={filteredTradeTypeList.map((tradeType) => ({
                option: (
                  <LinkButton
                    to={`/Masters/FrmTradeTypeMst.aspx?tradeTypeId=${tradeType.TRADETYPEID}`}
                    text={translate("Select")}
                  />
                ),
                "व्यापार प्रकार नांव": tradeType.TRADETYPENAME,
                स्थिती: tradeType.TRADETYPEFLAG, // Displaying 'Y' or 'N' directly
              }))}
              keyMapping={{
                [translate("Select")]: "option",
                [translate("व्यापार प्रकार नांव")]: "व्यापार प्रकार नांव",
                [translate("स्थिती")]: "स्थिती",
              }}
            />
          </div>
        ) : (
          <p>{translate("No trade types found.")}</p>
        )}
      </div>
    </div>
  );
}

export default FrmTradeTypeList;
