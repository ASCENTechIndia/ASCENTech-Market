import React, { useEffect, useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useLanguage } from "../../../Context/LanguageProvider";
import SaveButton from "../../../Components/Buttons_save/Savebutton";
import { Formik, Form, Field, ErrorMessage } from "formik";
import InputField from "../../../Components/InputField/InputField";
import Label from "../../../Components/Label/Label";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../Context/AuthContext";
import Table from "../../../Components/Table/Table";
import apiService from "../../../../apiService";

function FrmMenuMst() {
  const { translate } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const deptId = user?.deptId;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const menuId = queryParams.get("menuId");
  const parentId = queryParams.get("parentId");

  const [parentMenuOptions, setParentMenuOptions] = useState([]);
  const [rawCorporationData, setRawCorporationData] = useState([]);
  const [rawUserLevelData, setRawUserLevelData] = useState([]);
  const [menuData, setMenuData] = useState(null);
  const [isMenuDataLoaded, setIsMenuDataLoaded] = useState(false);

  const initialValues = {
    in_deptid: "",
    in_ParentMenuId: "",
    in_PageTitle: "",
    in_PagePath: "",
    in_PageType: "M",
    selectedCorporations: [],
    selectedUserLevels: [],
  };

  useEffect(() => {
    if (!deptId) return;
    const fetchParentMenu = async () => {
      try {
        const res = await apiService.post(`ParentMenuDropdown`, { dept_id: deptId });
        const opts = res.data.data.map((menu) => ({
          label: menu.PAGETITLE,
          value: menu.MENUID,
        }));
        setParentMenuOptions(opts);
      } catch (error) {
        console.error("Error fetching parent menu:", error);
      }
    };
    fetchParentMenu();
  }, [deptId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [corpRes, userRes] = await Promise.all([
          apiService.get(`CorporationDropdown`),
          apiService.get(`UserLevelData`),
        ]);
        setRawCorporationData(corpRes.data.data);
        setRawUserLevelData(userRes.data.data);
      } catch (error) {
        console.error("Error fetching corporation or user level data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      if (!menuId) {
        setIsMenuDataLoaded(true);
        return;
      }
      try {
        const res = await apiService.post(`FrmMenuMst`, { menu_id: menuId });
        const data = res.data.data[0] || {};
        setMenuData({
          in_ParentMenuId: data.PARENTMENUID || "",
          in_PageTitle: data.PAGETITLE || "",
          in_PagePath: data.PAGEPATH || "",
          in_PageType: data.PAGETYPE || "M",
          selectedCorporations: data.CORPORATIONS?.split(",") || [],
          selectedUserLevels: data.USERLEVELS?.split(",") || [],
        });
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setIsMenuDataLoaded(true);
      }
    };
    fetchMenuData();
  }, [menuId]);

  // ✅ Checkbox handlers
  const handleCorporationCheckboxChange = (corpid, key, checked, values, setFieldValue) => {
    const updated = checked
      ? [...(values.selectedCorporations || []), corpid]
      : (values.selectedCorporations || []).filter((id) => id !== corpid);
    setFieldValue("selectedCorporations", updated);
  };

  const handleUserLevelCheckboxChange = (userLevelId, key, checked, values, setFieldValue) => {
    const updated = checked
      ? [...(values.selectedUserLevels || []), userLevelId]
      : (values.selectedUserLevels || []).filter((id) => id !== userLevelId);
    setFieldValue("selectedUserLevels", updated);
  };

  const handleSubmit = (values) => {
    const payload = {
      ...values,
      in_deptid: deptId,
      menuId,
      parentId,
    };
    apiService
      .post(`SaveMenu`, payload)
      .then(() => navigate(-1))
      .catch(console.error);
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("मेनू मास्टर तपशील")}
        />
        <hr />

        {isMenuDataLoaded && (
          <Formik enableReinitialize initialValues={menuData || initialValues} onSubmit={handleSubmit}>
            {({ setFieldValue, values }) => (
              <Form className="container mt-4">
                {/* Page Title */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("Page Title")} :`} />
                  </div>
                  <div className="col-md-6">
                    <Field name="in_PageTitle" component={InputField} />
                    <ErrorMessage name="in_PageTitle" component="div" className="text-danger" />
                  </div>
                </div>

                {/* Parent Menu */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("मुख्य मेनू")} :`} />
                  </div>
                  <div className="col-md-6">
                    <Field
                      name="in_ParentMenuId"
                      component={InputField}
                      type="dropdown"
                      options={parentMenuOptions}
                    />
                    <ErrorMessage name="in_ParentMenuId" component="div" className="text-danger" />
                  </div>
                </div>

                {/* Page Path */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("Page Path")} :`} />
                  </div>
                  <div className="col-md-6">
                    <Field name="in_PagePath" component={InputField} />
                    <ErrorMessage name="in_PagePath" component="div" className="text-danger" />
                  </div>
                </div>

                {/* Page Type */}
                <div className="row mb-3 align-items-center">
                  <div className="col-md-2">
                    <Label text={`${translate("Page Type")} :`} />
                  </div>
                  <div className="col-md-6 d-flex gap-3">
                    <div>
                      <Field type="radio" name="in_PageType" value="M" id="pageTypeM" />
                      <label htmlFor="pageTypeM" className="ms-2">
                        मास्टर
                      </label>
                    </div>
                    <div>
                      <Field type="radio" name="in_PageType" value="T" id="pageTypeT" />
                      <label htmlFor="pageTypeT" className="ms-2">
                        व्यवहार
                      </label>
                    </div>
                  </div>
                </div>

                <hr />

                {/* ✅ Corporation & User Level Tables */}
                <div className="row mb-4">
                  <div className="col-md-5">
                    <Table
                      headers={[translate("निवडा"), translate("Corporation Name")]}
                      data={rawCorporationData.map((corp) => ({
                        ...corp,
                        checked: values.selectedCorporations?.includes(corp.CORPID),
                      }))}
                      keyMapping={{
                        [translate("निवडा")]: "checked",
                        [translate("Corporation Name")]: "CORPNAME",
                      }}
                      onCheckboxChange={(corpid, key, checked) =>
                        handleCorporationCheckboxChange(corpid, key, checked, values, setFieldValue)
                      }
                      checkboxIdentifier="CORPID"
                      showCheckboxInHeader={false}
                    />
                  </div>

                  <div className="col-md-5">
                    <Table
                      headers={[translate("निवडा"), translate("User Level")]}
                      data={rawUserLevelData.map((ul) => ({
                        ...ul,
                        checked: values.selectedUserLevels?.includes(ul.USERLEVELID),
                      }))}
                      keyMapping={{
                        [translate("निवडा")]: "checked",
                        [translate("User Level")]: "USERLEVEL",
                      }}
                      onCheckboxChange={(userLevelId, key, checked) =>
                        handleUserLevelCheckboxChange(userLevelId, key, checked, values, setFieldValue)
                      }
                      checkboxIdentifier="USERLEVELID"
                      showCheckboxInHeader={false}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-center gap-4">
                  <SaveButton type="submit" text={translate("साठवा")} />
                  <SaveButton type="button" text={translate("परत")} onClick={() => navigate(-1)} />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
}

export default FrmMenuMst;
