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



function FrmUserList() {
  const { user } = useAuth();
  const orgId = user?.ulbId;
  const departmentId = user?.deptId;
  const { translate } = useLanguage();
  const navigate = useNavigate();

  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUserList = async () => {
      if (!orgId || !departmentId) {
        setLoading(false);
        setError(translate("Organization ID or Department ID not available."));
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await apiService.post(`FrmUserList`, {
          orgId: orgId,
          departmentId: departmentId,
        });

        if (response.data && Array.isArray(response.data.data)) {
          setUserList(response.data.data);
        } else {
          setUserList([]);
          console.warn(
            "API response data for user list is not an array or empty:",
            response.data
          );
        }
      } catch (err) {
        console.error("Error fetching user list:", err);
        setError(translate("Failed to load user list. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    fetchUserList();
  }, [orgId, departmentId, translate]);

  const filteredUserList = useMemo(() => {
    if (!searchTerm) return userList;
    const lowerSearch = searchTerm.toLowerCase();
    return userList.filter(
      (userItem) =>
        (userItem.USERID &&
          userItem.USERID.toLowerCase().includes(lowerSearch)) ||
        (userItem.USERNAME &&
          userItem.USERNAME.toLowerCase().includes(lowerSearch)) ||
        (userItem.DEPTNAME &&
          userItem.DEPTNAME.toLowerCase().includes(lowerSearch)) ||
        (userItem.DESGNAME &&
          userItem.DESGNAME.toLowerCase().includes(lowerSearch))
    );
  }, [userList, searchTerm]);

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
          text={translate("वापरकर्ताची यादी")}
        />
        <hr />

        <Formik initialValues={initialValues}>
          {() => (
            <Form>
              <div className="row mb-3 align-items-center mt-4">
                <div className="col-12 col-sm-6 col-md-2 d-flex justify-content-center justify-content-md-start">
                  <SaveButton
                    type="button"
                    text={translate("नवीन जोडा")}
                    onClick={() => navigate("/Masters/FrmUserMst.aspx")}
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
                    placeholder={translate("Search here...")}
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

        {filteredUserList.length > 0 ? (
          <div className="table-responsive mt-4 ">
            <Table
              headers={[
                translate("निवडा"),
                translate("वापरकर्ता आयडी"),
                translate("वापरकर्ताचे नांव"),
                translate("विभाग"),
                translate("हुद्दा"),
              ]}
              data={filteredUserList.map((userItem) => ({
                option: (
                  <LinkButton
                    to={`/Masters/FrmUserMst.aspx?userId=${userItem.USERID}`}
                    text={translate("निवडा")}
                  />
                ),
                "वापरकर्ता आयडी": userItem.USERID,
                "वापरकर्ताचे नांव": userItem.USERNAME,
                विभाग: userItem.DEPTNAME || "",
                हुद्दा: userItem.DESGNAME || "",
              }))}
              keyMapping={{
                [translate("निवडा")]: "option",
                [translate("वापरकर्ता आयडी")]: "वापरकर्ता आयडी",
                [translate("वापरकर्ताचे नांव")]: "वापरकर्ताचे नांव",
                [translate("विभाग")]: "विभाग",
                [translate("हुद्दा")]: "हुद्दा",
              }}
            />
          </div>
        ) : (
          <div className="text-center mt-4">
            <strong>{translate("कोणताही डेटा उपलब्ध नाही")}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmUserList;
