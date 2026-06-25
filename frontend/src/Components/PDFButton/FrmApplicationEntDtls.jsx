import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font, // Import Font to register custom fonts
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 20,
    fontFamily: "NotoSansDevanagari",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    height: 50,
    width: 60,
    padding: 5,
  },
  titleBlock: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 10,
    fontWeight: "bold",
  },
  section: {
    border: "1px solid black",
    height: 760,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    padding: 2,
    paddingLeft: 20,
    paddingRight: 20,
    flexWrap: "wrap",
  },

  line: {
    marginTop: 2,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid black",
    backgroundColor: "#fff",
    border: "1px solid black",
    marginTop: 20,
  },
  tableCell: {
    fontSize: 9,
    padding: 4,
    borderRight: "1px solid black",
    textAlign: "center",
    flexGrow: 1, // Allow cells to grow
  },
  tableCellInfo: {
    fontSize: 9,
    paddingLeft: 4,
    borderRight: "1px solid black",
    textAlign: "left",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    border: "1px solid black",
  },
  centerText: {
    textAlign: "center",
  },
  photo: {
    height: 70, // Increased height
    width: 70, // Increased width
    padding: 5,
    objectFit: "contain",
  },
  imageHeaderRow: {
    flexDirection: "row",
    border: "1px solid black",
    marginTop: 20,
  },
  imageHeaderCell: {
    flex: 1,
    padding: 4,
    borderRight: "1px solid black",
  },
  imageHeaderLastCell: {
    flex: 1,
    padding: 4,
  },
  imageHeaderText: {
    textAlign: "center",
    fontSize: 10,
  },
  imageRow: {
    flexDirection: "row",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    borderBottom: "1px solid black",
  },
  imageCell: {
    flex: 1,
    borderRight: "1px solid black",
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },

  // Added for Page No and Report Date at bottom

  businessTypeTable: {
    border: "1px solid black",
    marginBottom: 10,
    width: "48%", // Adjusted width to allow side-by-side display
  },
  businessTypeHeader: {
    flexDirection: "row",
    borderBottom: "1px solid black",
  },
  businessTypeCellHeader: {
    flex: 1,
    padding: 5,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  businessTypeRow: {
    borderRight: "1px solid black",
  },

  businessTypeLastCell: {
    borderRight: "none", // No right border for the last cell in a row
  },
  // New style for side-by-side tables container

  Table: {
    margin: 10,
  },
  businessTypeCell: {
    flex: 1,
    padding: 5,
    fontSize: 9,
    textAlign: "center",
  },
  tradeTypeCellBorderRight: {
    borderRight: "1px solid black",
  },
  tradeTypeDetailRow: {
    flexDirection: "row", // Key for horizontal layout of cells within a row
  },
  tablesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const formatDate = (date) => {
  if (!date) return "";

  // Ensure it's a Date object
  const localDate = new Date(date);

  // Get YYYY-MM-DD in local timezone
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Month is 0-based
  const day = String(localDate.getDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
};

const FrmApplicationEntDtl = ({
  companyName,
  logo,
  data, // This 'data' now comes from /getFullApplicationDetails API
  tradeTypeRates,
  applicationTrades,
  directorDetails, // This is an array
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <View style={styles.logoRow}>
            <Image src={logo} style={styles.logo} />
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{companyName}</Text>
              <Text style={styles.subTitle}>अर्जा नोंदणी तपशील अहवाल</Text>
            </View>
          </View>
          <Text style={styles.line}></Text>

          <View style={styles.row}>
            <Text style={styles.cell}>
              दुकानचे नाव इंग्रजी : {data.SHOPNAME}
            </Text>
            <Text style={styles.cell}>
              दुकानचे नाव मराठी : {data.SHOPNAMEMAR}
            </Text>
            <Text></Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>पॅनकार्ड क्र. :{data.PANNO}</Text>
            <Text style={styles.cell}>संपर्क क्र. :{data.CONTACTNO}</Text>
            <Text style={styles.cell}>ई-मेल : {data.EMAIL}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>पत्ता : {data.ADDRESS}</Text>
          </View>

          <Text style={styles.line}></Text>
          <View style={styles.row}>
            <Text style={styles.cell}>वॉर्ड : {data.WARDNAME}</Text>
            <Text style={styles.cell}>झोन : {data.ZONENAME}</Text>
            <Text style={styles.cell}>
              From Date : {formatDate(data.FROMDT)}
            </Text>
            <Text style={styles.cell}>To Date : {formatDate(data.TODT)}</Text>
            <Text style={styles.cell}>रक्कम : {data.AMOUNT}</Text>
          </View>
          <Text style={styles.line}></Text>

          {/* Container for side-by-side tables */}
          <View style={styles.tablesContainer}>
            {/* First Table: Business Type and Rate */}
            <View style={styles.businessTypeTable}>
              <View style={styles.businessTypeHeader}>
                <Text
                  style={[
                    styles.businessTypeCellHeader,
                    styles.businessTypeRow,
                    { flex: 0.5 },
                  ]}
                >
                  व्यवसायाचे स्वरूप
                </Text>
                <Text style={[styles.businessTypeCellHeader, { flex: 0.5 }]}>
                  Rate
                </Text>
              </View>
              {tradeTypeRates && tradeTypeRates.length > 0 ? (
                tradeTypeRates.map((item, index) => (
                  <View
                    style={[
                      styles.tradeTypeDetailRow,
                      // Add a bottom border to every row to create the grid lines.
                      // This is more reliable than checking for the last row.
                      // The table container should have a single border, and then each row has a bottom border.
                      // The last row's bottom border will be covered by the container's bottom border.
                      { borderBottomWidth: 1, borderBottomColor: "black" }, // Changed this line
                    ]}
                    key={item.TRADETYPEID || index} // Unique key is important for lists
                  >
                    <Text
                      style={[
                        styles.businessTypeCell,
                        // Apply a right border to the first cell of the data row
                        {
                          flex: 0.5,
                          borderRightWidth: 1,
                          borderRightColor: "black",
                        }, // Added this line for the right border
                      ]}
                    >
                      {item.TRADETYPE || "N/A"} {/* Accessing item.TRADETYPE */}
                    </Text>
                    <Text
                      style={[
                        styles.businessTypeCell,
                        { flex: 0.5, borderRightWidth: 0 }, // Remove right border for the last cell in the row
                      ]}
                    >
                      {item.TRADTYPE_RATE || "N/A"}{" "}
                      {/* Accessing item.TRADTYPE_RATE */}
                    </Text>
                  </View>
                ))
              ) : (
                // Fallback for no data
                <View
                  style={[styles.tradeTypeDetailRow, { borderBottomWidth: 0 }]}
                >
                  <Text
                    style={[
                      styles.businessTypeCell,
                      { flex: 1, borderRightWidth: 0 },
                    ]}
                  >
                    No trade types found
                  </Text>
                </View>
              )}
            </View>

            {/* Second Table: Business Types */}
            <View style={styles.businessTypeTable}>
              <View style={styles.businessTypeHeader}>
                <Text style={[styles.businessTypeCellHeader, { flex: 1 }]}>
                  व्यवसायाचे प्रकार
                </Text>
              </View>
              {applicationTrades && applicationTrades.length > 0 ? (
                applicationTrades.map((item, index) => (
                  <View
                    style={[
                      styles.tradeTypeDetailRow,
                      // Apply bottom border to all rows.
                      { borderBottomWidth: 1, borderBottomColor: "black" },
                    ]}
                    key={item.TRADEID || index}
                  >
                    <Text
                      style={[
                        styles.businessTypeCell,
                        { flex: 1, borderRightWidth: 0 }, // No right border as it's a single column
                      ]}
                    >
                      {item.TRADENAME || "N/A"}
                    </Text>
                  </View>
                ))
              ) : (
                <View
                  style={[styles.tradeTypeDetailRow, { borderBottomWidth: 0 }]}
                >
                  <Text
                    style={[
                      styles.businessTypeCell,
                      { flex: 1, borderRightWidth: 0 },
                    ]}
                  >
                    No business types found
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.line}></Text>
          <View style={styles.row}>
            <Text>वस्तू विक्रीस ठेवित आहे का ? : {data.ISPROD}</Text>
            <Text>
              स्वतःचे मालकीचे जागेत व्यवसाय करीत आहे का? : {data.OWNSPACE}
            </Text>
          </View>

          <View style={styles.row}>
            <Text>जागा मालकाचे नाव : {data.PLACEOWNERNAME}</Text>
            <Text>जागा मालकाचा पत्ता : {data.PLACEOWNERADDRESS}</Text>
          </View>
          <View style={styles.row}>
            <Text>भाडे करार कोणासोबत केलेला आहे : {data.AGRMENTWITH}</Text>
            <Text>वापरात आलेले जागेचे क्षेत्र चौ. फू. मध्ये: {data.AREA}</Text>
          </View>

          <View style={styles.row}>
            <Text>
              व्यवसायासाठी म. न. पा. चे नाहरकत प्रमाणपत्र घेतलेले आहे का:{" "}
              {data.ISCORPNOC}
            </Text>
            <Text>व्यवसाय सुरु केल्याचे वर्ष : {data.BUSSTARTYR}</Text>
          </View>

          <View style={styles.row}>
            <Text>शॉप ॲक्ट नोंदणी क्र. : {data.SHOPACTNO}</Text>
            <Text>
              अन्न व औषध प्रशासन कायद्यान्वये नोंदणी क्र. : {data.FOODLICNO}
            </Text>
          </View>
          <Text style={styles.line}></Text>
          <View style={styles.Table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 1 }]}>Aadhar No.</Text>
              <Text style={[styles.tableCell, { flex: 1.2 }]}>
                Director Name
              </Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Mobile No.</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>Email </Text>
              <Text style={[styles.tableCell, { flex: 0.5 }]}>Gender</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Address</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Applicant</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>
                Director Image
              </Text>
            </View>

            {/* Iterate over directorDetails array */}
            {directorDetails && directorDetails.length > 0 ? (
              directorDetails.map((director, index) => (
                <View
                  style={styles.tableRow}
                  key={director.DIRECTORID || index}
                >
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {director.ADHARNO || "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.2 }]}>
                    {director.DIRCTORNAME || "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {director.MOBILENO || "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1.5 }]}>
                    {director.EMAIL || "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.5 }]}>
                    {director.GENDER || "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {director.ADDRESS || "N/A"}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {director.APPLITYPENAME || "N/A"}
                  </Text>
                  <View
                    style={[
                      styles.tableCell,
                      {
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        padding: 4,
                      },
                    ]}
                  >
                    {director.imgdirectorimage ? (
                      <Image
                        src={`${API_BASE_URL}${director.imgdirectorimage}`} // <--- The key change here
                        style={styles.photo}
                      />
                    ) : (
                      <Text>No Image</Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 10 }]}>
                  No director details found.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FrmApplicationEntDtl;
