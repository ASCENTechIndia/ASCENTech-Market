
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Styles for the PDF document
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9, // Slightly smaller font for more content
    fontFamily: "NotoSansDevanagari", // Use the registered font for the entire page
  },

  headerContainer: {
    width: "100%",
    marginBottom: 10, // Space after the entire header block
    // Adding a border to the headerContainer to make it appear as "one box"
    borderWidth: 1,
    borderColor: "black",
    padding: 5, // Padding inside the headerContainer box
  },
  // Style for the print date text, placed at the top right of the header
  printDateText: {
    fontSize: 8,
    textAlign: "right", // Align the text to the right
    marginBottom: 5, // Space below the print date before the next element
  },
  // Main header content containing the logo, company name, and department name
  mainHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    // Removed borderBottom here as a separate horizontalRule will be used
    paddingBottom: 5, // Padding for content before the HR
    width: "100%", // Ensure the main header spans the full width
  },
  logo: {
    height: 50,
    width: 60,
    marginRight: 10,
  },
  // Container for company and department names, allowing them to be centered
  titleBlock: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    textAlign: "center", // Center the company name
    fontFamily: "NotoSansDevanagari",
  },
  departmentName: {
    fontSize: 10,
    textAlign: "center", // Center the department name
  },
  reportMainTitle: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 5, // Space after the HR
    marginBottom: 5, // Space before the next HR
    fontWeight: "bold",
    fontFamily: "NotoSansDevanagari",
  },
  // New style for the horizontal rule
  horizontalRule: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    width: "100%",
    marginVertical: 5, // Space above and below the HR
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 5, // Space after the HR
    borderColor: "#000", // Ensure borders are visible
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f2f2f2",
    padding: 5,
    textAlign: "center",
    fontWeight: "bold",
    flexWrap: "wrap", // Allow text to wrap
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: "center",
    flexWrap: "wrap", // Allow text to wrap
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 10,
  },
  // Column Widths (Adjust these based on your data and desired layout)
  colSrNo: {
    width: "4%",
  }, // क्र.
  colShopName: {
    width: "15%",
  }, // दुकानाचे नाव
  colOwnerName: {
    width: "15%",
  }, // नाव
  colPrabhag: {
    width: "8%",
  }, // प्रभाग
  colApplicationDate: {
    width: "10%",
  }, // दिनांक
  colPANNo: {
    width: "12%",
  }, // पेन कार्ड न .
  colMobileNo: {
    width: "10%",
  }, // मोबईल . क्र .
  colEmail: {
    width: "15%",
  }, // ई-मेल
  colAddress: {
    width: "11%",
  }, // पत्ता
});

const FrmApplicationListReportPDF = ({
  companyName,
  logo,
  data,
  fromDate,
  toDate,
  prabhagId,
}) => {
  const applicationDataArray = Array.isArray(data) ? data : []; // Ensure data is always an array

  // Helper function to format date for PDF (ensure consistency with main component)
  const formatDateForPdf = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const currentPrintDate = formatDateForPdf(new Date()); // Get current date for print

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        {" "}
        {/* Main header container with a border */}
        <View style={pdfStyles.headerContainer}>
          {/* Print Date positioned at the top right */}
          <Text style={pdfStyles.printDateText}>
            Print Date {currentPrintDate}{" "}
            {new Date().toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>

          {/* Main header content with logo, company, and department names */}
          <View style={pdfStyles.mainHeaderContent}>
            {logo && <Image src={logo} style={pdfStyles.logo} />}
            <View style={pdfStyles.titleBlock}>
              <Text style={pdfStyles.companyName}>{companyName}</Text>
              <Text style={pdfStyles.departmentName}>बाजार व परवाना विभाग</Text>
            </View>
          </View>

          {/* Horizontal Rule after mainHeaderContent */}
          <View style={pdfStyles.horizontalRule} />

          {/* Main report title from image */}
          <Text style={pdfStyles.reportMainTitle}>प्राप्त अर्जाची यादी</Text>

          {/* Table */}
          <View style={pdfStyles.table}>
            {/* Table Header */}
            <View style={pdfStyles.tableRow}>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colSrNo]}>
                क्र.
              </Text>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colShopName]}>
                दुकानाचे नाव
              </Text>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colOwnerName]}>
                नाव
              </Text>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colPrabhag]}>
                प्रभाग
              </Text>
              <Text
                style={[pdfStyles.tableColHeader, pdfStyles.colApplicationDate]}
              >
                दिनांक
              </Text>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colPANNo]}>
                पेन कार्ड न.
              </Text>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colMobileNo]}>
                मोबईल. क्र.
              </Text>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colEmail]}>
                ई-मेल
              </Text>
              <Text style={[pdfStyles.tableColHeader, pdfStyles.colAddress]}>
                पत्ता
              </Text>
            </View>

            {/* Table Rows */}
            {applicationDataArray.map((item, index) => (
              <View style={pdfStyles.tableRow} key={index}>
                <Text style={[pdfStyles.tableCol, pdfStyles.colSrNo]}>
                  {index + 1}
                </Text>
                <Text style={[pdfStyles.tableCol, pdfStyles.colShopName]}>
                  {item.SHOPNAME || ""}
                </Text>
                <Text style={[pdfStyles.tableCol, pdfStyles.colOwnerName]}>
                  {item.OWNERNAME || ""}
                </Text>
                <Text style={[pdfStyles.tableCol, pdfStyles.colPrabhag]}>
                  {item.ZONENAME || ""}
                </Text>{" "}
                <Text
                  style={[pdfStyles.tableCol, pdfStyles.colApplicationDate]}
                >
                  {formatDateForPdf(item.APPLICATIONDATE)}
                </Text>
                <Text style={[pdfStyles.tableCol, pdfStyles.colPANNo]}>
                  {item.PANNO || ""}
                </Text>
                <Text style={[pdfStyles.tableCol, pdfStyles.colMobileNo]}>
                  {item.MOBILENO || ""}
                </Text>
                <Text style={[pdfStyles.tableCol, pdfStyles.colEmail]}>
                  {item.EMAIL || ""}
                </Text>
                <Text style={[pdfStyles.tableCol, pdfStyles.colAddress]}>
                  {item.ADDRESS || ""}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FrmApplicationListReportPDF;