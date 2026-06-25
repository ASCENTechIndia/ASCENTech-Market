import React, { useState, useEffect } from "react";
import Header from "../../../HOC/Header/Header";
import Navbar from "../../../HOC/Navbar/Navbar";
import HeaderLabel from "../../../Components/HeaderLabel/HeaderLabel";
import { useLanguage } from "../../../Context/LanguageProvider";
import apiService from "../../../../apiService";
import { useAuth } from "../../../Context/AuthContext";
import Table from "../../../Components/Table/Table";

function FrmCertiRePrint() {
  const { translate } = useLanguage();
  const { user } = useAuth();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch certificate reprint data by ULB ID
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.ulbId) {
        console.warn("ULB ID not found in user session.");
        return;
      }

      try {
        setLoading(true);
        const payload = { ulbId: user.ulbId };
        console.log("📤 Sending payload:", payload);

        const response = await apiService.post("getCertificateGenReport", payload);
        console.log("📥 API Response:", response);

        const records = response?.data?.data || [];
        setTableData(records);
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.ulbId]);

  // Define table headers and key mapping
  const headers = [
    "Application ID",
    "License No",
    "Shop Name",
    "Contact No",
    "Address",
    "Trade Name",
    "Valid From",
    "Valid Till",
    "Amount",
    "Sanchalak Name",
    "Sanchalak Type",
    "Email",
  ];

  const keyMapping = {
    "Application ID": "APPLIID",
    "License No": "LICENCNO",
    "Shop Name": "SHOPNAME",
    "Contact No": "CONTACTNO",
    "Address": "ADDRESS",
    "Trade Name": "TRADE_NAME",
    "Valid From": "VALIDFROM",
    "Valid Till": "VALIDTILLDT",
    "Amount": "AMOUNT",
    "Sanchalak Name": "SANCHALAKNAME",
    "Sanchalak Type": "SANCHALAKTYPE",
    "Email": "SANCHALAKEMAILID",
  };

  // Custom renderers (for formatting specific fields)
  const customRenderers = {
    "Valid From": (row) =>
      row.VALIDFROM ? new Date(row.VALIDFROM).toLocaleDateString() : "-",
    "Valid Till": (row) =>
      row.VALIDTILLDT ? new Date(row.VALIDTILLDT).toLocaleDateString() : "-",
  };

  return (
    <div>
      <Header />
      <Navbar />
      <div className="container">
        <HeaderLabel
          className="headerlabel mt-4"
          text={translate("Reprint Certificate")}
        />
        <hr />

        <div className="mt-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <Table
              headers={headers}
              data={tableData}
              keyMapping={keyMapping}
              customRenderers={customRenderers}
              noDataMessage="No certificate data available."
              showCheckboxInHeader={false}
            />
          )}
        </div>
      </div> 
    </div>
  );
}

export default FrmCertiRePrint;
