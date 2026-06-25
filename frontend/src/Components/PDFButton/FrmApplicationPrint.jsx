import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Styles
const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    padding: 20,
    fontFamily: "NotoSansDevanagari", // Ensure this font is properly registered in your PDF setup if it's a custom font
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    height: 50,
    width: 60,
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
    padding: 10,
    marginBottom: 10,
    height: 700,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    padding: 2,
    flexWrap: "wrap", // Added for better text wrapping in rows
  },
  cell: {
    width: "48%", // This implies two cells per row, adjust as needed
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
  },
  tableCell: {
    fontSize: 9,
    padding: 4,
    borderRight: "1px solid black",
    textAlign: "center",
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
    height: 60,
    width: 60,
    padding: 5,
    objectFit: "cover", // Added to ensure image scales nicely within its bounds
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
  imageLastCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    height: 100,
    width: 100,
  },
  shopImage: {
    width: 150,
    height: 100,
    objectFit: "cover",
  },
});

const FrmApplicationPrint = ({
  companyName,
  logo,
  data,
  applicantTradeTypesData, // This is expected to be an array
  imagesData,
}) => {
  // Safely get the TRADE_TYPES from the first item in the array
  // If applicantTradeTypesData is empty or the property doesn't exist, it will default to 'N/A'
  const tradeTypesDisplay =
    applicantTradeTypesData && applicantTradeTypesData.length > 0
      ? applicantTradeTypesData[0].TRADE_TYPES
      : "N/A"; // Or "" if you prefer it empty
  const today = moment().format("DD/MM/YYYY"); // Get today's date
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoRow}>
          <Image src={logo} style={styles.logo} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{companyName}</Text>
            <Text style={styles.subTitle}>Application Print Report</Text>
            <Text style={styles.subTitle}>बाजार व परवाना विभाग</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text>प्राथमिक माहिती</Text>
          <Text style={styles.line}></Text>

          <View style={styles.row}>
            <Text>दुकानाचे नाव : {data.SHOPNAME}</Text>
            <Text>संपर्क क्र. : {data.CONTACTNO}</Text>
          </View>
          <View style={styles.row}>
            <Text>पॅन कार्ड क्र. :{data.PANCARDNO}</Text>
            <Text /> {/* Keep this if it's for spacing, otherwise remove */}
          </View>
          <View style={styles.row}>
            <Text>ई-मेल : {data.EMAIL}</Text>
            <Text /> {/* Keep this if it's for spacing, otherwise remove */}
          </View>
          <View style={styles.row}>
            <Text>पत्ता : {data.ADDRESS}</Text>
            <Text /> {/* Keep this if it's for spacing, otherwise remove */}
          </View>
          <View style={styles.row}>
            <Text>
              वस्तू विक्रीस ठेवित आहे का ? :{" "}
              {data.ISPROD === "Y" ? "होय" : data.ISPROD === "N" ? "नाही" : ""}
            </Text>
            <Text>वापरात असलेले जागेचे क्षेत्रफळ : {data.AREA}</Text>
            <Text>व्यवसाय सुरु केलेले वर्ष : {data.BUSINESSSTARTYEAR}</Text>
          </View>
          {/* CORRECTED LINE HERE */}
          <View style={styles.row}>
            <Text>व्यवसायाचे स्वरूप : {tradeTypesDisplay}</Text>
          </View>
          <View style={styles.row}>
            <Text>
              स्वतःचे मालकीचे जागेत व्यवसाय करीत आहे का? :{" "}
              {data.OWNSPACE === "Y"
                ? "होय"
                : data.OWNSPACE === "N"
                ? "नाही"
                : ""}
            </Text>
            <Text>
              व्यवसायासाठी म.न.पा.चे नाहरकत प्रमाणपत्र घेतले आहे का? :{" "}
              {data.ISCORPNOC === "Y"
                ? "होय"
                : data.ISCORPNOC === "N"
                ? "नाही"
                : ""}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>जागा मालकाचे नाव : {data.PLACEOWNERNAME}</Text>
            <Text> शॉप ऍक्ट कायद्यान्वये नोंदणी क्र. : {data.SHOPACTNO}</Text>
          </View>
          <View style={styles.row}>
            <Text>जागा मालकाचा पत्ता : {data.PLACEOWNERADDRESS}</Text>
            <Text /> {/* Keep this if it's for spacing, otherwise remove */}
          </View>
          <View style={styles.row}>
            <Text>
              अन्न व औषध प्रशासन कायद्यान्वये नोंदणी क्र. : {data.FOODLICNO}
            </Text>
          </View>
          <Text style={styles.line}></Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCellInfo, { flex: 1 }]}>
              संचालक माहिती
            </Text>
          </View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 1 }]}>संचालकाचे नाव</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>पत्ता</Text>
            <Text style={[styles.tableCell, { flex: 0.5 }]}>लिंग</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>आधार क्र</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>मोबाईल क्र</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>अर्जदार प्रकार</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>संचालकाचा फोटो</Text>
          </View>

          <View style={styles.tableRow}>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, textAlign: "center", padding: 4 },
              ]}
            >
              {data.DIRECTORNAME}
            </Text>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, textAlign: "center", padding: 4 },
              ]}
            >
              {data.DIRECTORADDRESS}
            </Text>
            <Text
              style={[
                styles.tableCell,
                { flex: 0.5, textAlign: "center", padding: 4 },
              ]}
            >
              {data.DIRECTORGENDER}
            </Text>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, textAlign: "center", padding: 4 },
              ]}
            >
              {data.DIRECTORAADHAARNO}
            </Text>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, textAlign: "center", padding: 4 },
              ]}
            >
              {data.DIRECTORMOBILENO}
            </Text>
            <Text
              style={[
                styles.tableCell,
                { flex: 1, textAlign: "center", padding: 4 },
              ]}
            >
              {data.DIRECTORAPPTYPE}
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
              {data.directorPhoto && (
                <Image
                  src={`${API_BASE_URL}${data.directorPhoto}`}
                  style={styles.photo}
                />
              )}
            </View>
          </View>

          {/* Image Header Row */}
          <View style={styles.imageHeaderRow}>
            <View style={styles.imageHeaderCell}>
              <Text style={styles.imageHeaderText}>दुकानाचा बाहेरील फोटो</Text>
            </View>
            <View style={styles.imageHeaderLastCell}>
              <Text style={styles.imageHeaderText}>दुकानाचा आतील फोटो</Text>
            </View>
          </View>

          {/* Image Row */}
          <View style={styles.imageRow}>
            <View style={styles.imageCell}>
              {/* Check if imagesData and shopeimg_otr exist before rendering */}
              {imagesData && imagesData.shopeimg_otr && (
                <Image
                  src={imagesData.shopeimg_otr} // Use the full URL directly
                  style={styles.shopImage}
                />
              )}
            </View>
            <View style={styles.imageLastCell}>
              {/* Check if imagesData and shopeimg_inr exist before rendering */}
              {imagesData && imagesData.shopeimg_inr && (
                <Image
                  src={imagesData.shopeimg_inr} // Use the full URL directly
                  style={styles.shopImage}
                />
              )}
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.pageNumber}>Page No : 1 </Text>
          <Text style={styles.reportDate}>Report Date : {today}</Text>
          <Text></Text>
        </View>
      </Page>
    </Document>
  );
};

export default FrmApplicationPrint;
