import React, { useEffect, useState, useMemo } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import Label from "../../../Components/Label/Label";
import InputField from "../../../Components/InputField/InputField";
import { useLanguage } from "../../../Context/LanguageProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";

import { useNavigate } from "react-router-dom";
import Table from "../../../Components/Table/Table";
import LinkButton from "../../../Components/LinkButton/LinkButton";
import { useAuth } from "../../../Context/AuthContext";
import apiService from "../../../../apiService";

function FrmUlbTipList() {
  const { translate } = useLanguage();
  const [corporationOptions, setCorporationOptions] = useState([]);
  const navigate = useNavigate();
  const [ulbTipList, setUlbTipList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const ulbId = user?.ulbId;

 
  useEffect(() => {
    const fetchCorporations = async () => {
      try {
        const response = await apiService.get(`CorporationDropdown`);
        if (response.data && Array.isArray(response.data.data)) {
          const options = response.data.data.map((corp) => ({
            value: corp.CORPID,
            label: corp.CORPNAME,
          }));
          setCorporationOptions(options);
        } else {
          setCorporationOptions([]);
        }
      } catch (err) {
        console.error("Error fetching corporation dropdown:", err);
      }
    };
    fetchCorporations();
  }, []);

 
  useEffect(() => {
    const fetchTipList = async () => {
      if (!ulbId) return;

      try {
        const response = await apiService.post("FrmUlbTipList", {
          UlbId: ulbId,
        });

        if (response.data && Array.isArray(response.data.data)) {
          setUlbTipList(response.data.data);
        } else {
          setUlbTipList([]);
        }
      } catch (err) {
        console.error("Error fetching ULB Tip List:", err);
      }
    };

    fetchTipList();
  }, [ulbId]);

  
  const filteredUlbTipList = useMemo(() => {
    if (!searchTerm) return ulbTipList;
    const lowerSearch = searchTerm.toLowerCase();
    return ulbTipList.filter(
      (item) =>
        item.VAR_ULBTIP_TIP?.toLowerCase().includes(lowerSearch) ||
        item.VAR_ULBTIP_SLOGAN?.toLowerCase().includes(lowerSearch)
    );
  }, [ulbTipList, searchTerm]);

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel className="headerlabel mt-4" text={translate("ULB TIP MASTER")} />
        <hr />

        <Formik
          initialValues={{ Name: String(ulbId || ""), search: "" }}
          enableReinitialize
        >
          {({ setFieldValue }) => (
            <Form className="container mt-4">
              {/* 🔹 ULB Dropdown */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("नगरपालिकेचे नाव ")} :`} required />
                </div>
                <div className="col-md-6">
                  <Field
                    name="Name"
                    component={InputField}
                    type="dropdown"
                    disabled={true}
                    options={corporationOptions}
                    value={ulbId}
                    onChange={async (e) => {
                      const selectedUlbId = e.target.value;
                      setFieldValue("Name", selectedUlbId);
                      setSearchTerm("");

                      try {
                        const response = await apiService.post("FrmUlbTipList", {
                          UlbId: selectedUlbId,
                        });
                        if (response.data && Array.isArray(response.data.data)) {
                          setUlbTipList(response.data.data);
                        } else {
                          setUlbTipList([]);
                        }
                      } catch (error) {
                        console.error("Error fetching tip list:", error);
                      }
                    }}
                    placeholder={translate("Select option")}
                  />
                  <ErrorMessage name="Name" component="div" className="text-danger" />
                </div>
              </div>

              {/* 🔹 Search Field */}
              <div className="row mb-3 align-items-center">
                <div className="col-md-2">
                  <Label text={`${translate("शोधा")} :`} required />
                </div>
                <div className="col-md-6">
                  <Field
                    name="search"
                    placeholder={translate("Search here...")}
                    className="form-control"
                    component={InputField}
                    onChange={(e) => {
                      setFieldValue("search", e.target.value);
                      setSearchTerm(e.target.value);
                    }}
                  />
                  <ErrorMessage name="search" component="div" className="text-danger" />
                </div>
                <div className="col-md-2 d-flex justify-content-end">
                  <SaveButton
                    text={translate("नवीन माहिती जोडा")}
                    to="/Masters/FrmUlbTipMst.aspx"
                  />
                </div>
              </div>

              {/* 🔹 Table Section */}
              {filteredUlbTipList.length > 0 ? (
                <div className="table-responsive mt-4">
                  <Table
                    headers={[
                      translate("Select"),
                      translate("ULB TIP TEXT"),
                      translate("ULB SLOGAN TEXT"),
                      translate("Active"),
                      translate("Inserted By"),
                      translate("Inserted Date"),
                    ]}
                    data={filteredUlbTipList.map((tipItem) => ({
                      option: (
                        <LinkButton
                          to={`/Masters/FrmUlbTipMst.aspx?ulbTipId=${tipItem.NUM_ULBTIP_ID}`}
                          text={translate("Select")}
                        />
                      ),
                      "ULB TIP TEXT": tipItem.VAR_ULBTIP_TIP,
                      "ULB SLOGAN TEXT": tipItem.VAR_ULBTIP_SLOGAN,
                      Active: tipItem.VAR_ULBTIP_ACTIVE,
                      "Inserted By": tipItem.VAR_ULBTIP_INSBY,
                      "Inserted Date": new Date(
                        tipItem.DAT_ULBTIP_INSDATE
                      ).toLocaleDateString(),
                    }))}
                    keyMapping={{
                      [translate("Select")]: "option",
                      [translate("ULB TIP TEXT")]: "ULB TIP TEXT",
                      [translate("ULB SLOGAN TEXT")]: "ULB SLOGAN TEXT",
                      [translate("Active")]: "Active",
                      [translate("Inserted By")]: "Inserted By",
                      [translate("Inserted Date")]: "Inserted Date",
                    }}
                  />
                </div>
              ) : (
                <p className="text-center mt-4 text-muted">
                  {translate("No records found")}
                </p>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default FrmUlbTipList;
