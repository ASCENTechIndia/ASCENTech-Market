import React, { useEffect, useState, useMemo } from "react"; // Import useMemo
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
import apiService from "../../../../apiService"
import { useNavigate } from "react-router-dom";



function FrmTradeList() {
  const { user } = useAuth();
  const ulbId = user?.ulbId;
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const [tradeList, setTradeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for the search input

  useEffect(() => {
    const fetchTradeList = async () => {
      if (!ulbId) {
        // Ensure ulbId is available before fetching
        setLoading(false);
        setError("ULB ID not available. Cannot fetch trade list.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.post(`FrmTradeList`, {
          org_id: ulbId,
        });
        if (response.data && Array.isArray(response.data.data)) {
          setTradeList(response.data.data);
        } else {
          setTradeList([]); // Ensure it's an array even if data is empty or not an array
          console.warn("API response data is not an array:", response.data);
        }
      } catch (err) {
        console.error("Error fetching trade list:", err);
        setError("Failed to load trade list. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTradeList();
  }, [ulbId]); // Dependency array includes ulbId

  // Use useMemo to memoize the filtered list, recalculating only when tradeList or searchTerm changes
  const filteredTradeList = useMemo(() => {
    if (!searchTerm) {
      return tradeList; // If search term is empty, return original list
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return tradeList.filter(
      (trade) =>
        trade.TRADENAME &&
        trade.TRADENAME.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [tradeList, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const initialValues = {
    search: "", // Still used by Formik, but the state `searchTerm` will drive the filtering
  };

  return (
    <div>
      <Header />
      <Navbar />

      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("व्यापार मास्टर यादी")}
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
                    onClick={() => navigate("/Masters/FrmTradeMst.aspx")}
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
                    value={searchTerm} // Control the input with state
                    onChange={handleSearchChange} // Update state on change
                  />
                  {/* ErrorMessage for 'search' would be used if you had validation on it */}
                </div>
              </div>
            </Form>
          )}
        </Formik>
        <hr />

        {filteredTradeList.length > 0 ? (
          <div className="table-container mt-4 w-50">
            <Table
              headers={[
                translate("Select"),
                translate("व्यापाराचे नांव"),
                translate("स्थिती"),
              ]}
              data={filteredTradeList.map((trade) => ({
                // Use filteredTradeList here
                option: (
                  <LinkButton
                    to={`/Masters/FrmTradeMst.aspx?tradeId=${trade.TRADEID}`}
                    text={translate("Select")}
                  />
                ),
                "व्यापाराचे नांव": trade.TRADENAME,
                स्थिती: trade.TRADEFLAG,
              }))}
              keyMapping={{
                [translate("Select")]: "option",
                [translate("व्यापाराचे नांव")]: "व्यापाराचे नांव",
                [translate("स्थिती")]: "स्थिती",
              }}
            />
          </div>
        ) : (
          <p className="text-center mt-4">
            {searchTerm
              ? translate("No matching trades found.")
              : translate("No trade data available.")}
          </p>
        )}
      </div>
    </div>
  );
}

export default FrmTradeList;
