import React, { useEffect, useState } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import Table from "../../../Components/Table/Table"; // Assuming your Table component is here
import { useLanguage } from "../../../Context/LanguageProvider"; // Assuming you have this context for translation
import LinkButton from "../../../Components/LinkButton/LinkButton";
import apiService from "../../../../apiService"

function FrmUserAccessList() {
  const { translate } = useLanguage(); // Initialize translation hook
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const CORP_ID_TO_FETCH = 1;

        const response = await apiService.post(
          `getUsersByCorporationId`,
          {
            corp_id: CORP_ID_TO_FETCH,
          }
        );
        setUserList(response.data.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("User Access List")}
        />
        <hr />

        {loading && <p className="text-center">Loading user data...</p>}
        {error && <p className="text-center text-danger">{error}</p>}

        {!loading && !error && userList.length > 0 && (
          <div className="table-container mt-4">
            <Table
              headers={[
                translate("Select"),
                translate("User Id"),
                translate("User Name"),
                translate("User Level"),
                translate("Valid From"),
                translate("Valid Upto"),
              ]}
              data={userList.map((userItem) => ({
                option: (
                  <LinkButton
                    // to={`/Masters/FrmUserMst.aspx?userId=${userItem.USERID}&corpId=${userItem.CORPID}`}
                    text={translate("Select")}
                  />
                ),

                "User Id": userItem.USERID,
                "User Name": (
                  <div className="wrap-text">{userItem.USERNAME}</div>
                ),
                "User Level": userItem.USERLEVEL,

                "Valid From": userItem.VALIDFROM
                  ? new Date(userItem.VALIDFROM).toLocaleDateString()
                  : "-",
                "Valid Upto": userItem.VALIDUPTO
                  ? new Date(userItem.VALIDUPTO).toLocaleDateString()
                  : "-",
              }))}
              keyMapping={{
                [translate("Select")]: "option", // Maps the header "Select" to the 'option' key in the data
                [translate("User Id")]: "User Id",
                [translate("User Name")]: "User Name",
                [translate("User Level")]: "User Level",
                [translate("Valid From")]: "Valid From",
                [translate("Valid Upto")]: "Valid Upto",
              }}
              noDataMessage={translate("No user data available.")}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FrmUserAccessList;
