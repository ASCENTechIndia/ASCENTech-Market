import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "NotoSansDevanagari",
  src: "/fonts/NotoSansDevanagari-Regular.ttf", // Adjust path as necessary
});

// Styles for the PDF document
const pdfStyles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    backgroundColor: "#fff",
    fontFamily: "NotoSansDevanagari",
  },
  headerContainer: {
    width: "100%",
    marginBottom: 10,
    padding: 5,
  },
  mainHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 5,
    width: "100%",
  },
  logo: {
    height: 50,
    width: 60,
    marginRight: 10,
  },
  titleBlock: {
    flex: 1,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginRight: 30,
  },
  companyName: {
    fontSize: 14,
    marginBottom: 2,
    textAlign: "center",
  },
  departmentName: {
    fontSize: 10,
    textAlign: "center",
  },
  horizontalRule: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
    width: "100%",
    marginVertical: 5,
  },
  reportTitleMarathi1: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 2,
  },
  reportTitleMarathi2: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 5,
  },
  reportTitleMarathi3: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 5,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 5,
    borderColor: "#000",
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
    padding: 5,
    textAlign: "center",
    flexWrap: "wrap",
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: "center",
    flexWrap: "wrap",
    verticalAlign: "middle",
  },
  colSrNo: { width: "5%" },
  colInformation: { width: "18%" },
  colLicenseType: { width: "15%" },
  colLicensePeriod: { width: "15%" },
  colReceiptNo: { width: "12%" },
  colReceiptDate: { width: "15%" },
  colTransactionAmount: { width: "20%" },
  footerText: {
    position: "absolute",
    bottom: 15,
    left: 30, // Adjusted to match the padding of the page
    fontSize: 8,
  },
  // Styles for the total amount row
  totalLabelCol: {
    width: "80%", // Combines the width of first 6 columns
    padding: 5,
    textAlign: "right",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0, // Important: remove right border for merging
    borderBottomWidth: 1, // Added bottom border
  },
  totalAmountCol: {
    width: "20%", // Matches the width of colTransactionAmount
    padding: 5,
    textAlign: "center",
    fontWeight: "bold",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1, // Important: add left border to separate from label
    borderTopWidth: 0,
    borderRightWidth: 1, // Added right border
    borderBottomWidth: 1, // Added bottom border
  },
});

const FrmChallanReportPDF = ({ companyName, logo, data }) => {
  const applicationDataArray = Array.isArray(data) ? data : [];

  const formatDateForPdf = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const currentPrintDate = formatDateForPdf(new Date());

  // --- Pagination Logic ---
  const rowsPerPage = 10; // Number of rows per page (you can adjust this to 5 or 6 as needed)
  const chunkArray = (arr, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      chunks.push(arr.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const dataChunks = chunkArray(applicationDataArray, rowsPerPage);
  const totalPagesInDoc = dataChunks.length; // Total number of pages based on chunks

  // --- Calculate Total Amount ---
  const totalAmount = applicationDataArray.reduce((sum, item) => {
    // Ensure AMOUNT is a number before summing, default to 0 if invalid
    const amount = parseFloat(item.AMOUNT) || 0;
    return sum + amount;
  }, 0);

  return (
    <Document>
      {dataChunks.map((chunk, pageIndex) => (
        <Page
          key={pageIndex} // Unique key for each page
          size="A4"
          orientation="portrait"
          style={pdfStyles.page}
          // The render prop generates the content for each page
          render={({
            pageNumber: internalPageNumber,
            totalPages: internalTotalPages,
          }) => (
            <>
              {/* Header (will appear on each page) */}
              <View style={pdfStyles.headerContainer}>
                <View style={pdfStyles.mainHeaderContent}>
                  {logo && <Image src={logo} style={pdfStyles.logo} />}
                  <View style={pdfStyles.titleBlock}>
                    <Text style={pdfStyles.companyName}>{companyName}</Text>
                    <Text style={pdfStyles.departmentName}>परवाना विभाग</Text>
                  </View>
                </View>

                <Text style={pdfStyles.reportTitleMarathi1}>
                  परवाना शुल्क - परवाना भरणा चलन
                </Text>
                <Text style={pdfStyles.reportTitleMarathi2}>
                  नमुना १८ नियम २०(१०)(१) ११(२) पहा
                </Text>
                <Text style={pdfStyles.reportTitleMarathi3}>
                  २०२२-२०२३ वर्षाकरिता संबंधी जमा वसुली नोंदवही
                </Text>

                {/* Table for the current chunk of data */}
                <View style={pdfStyles.table}>
                  {/* Table Header Row (will appear on each page) */}
                  <View style={pdfStyles.tableRow}>
                    <Text style={[pdfStyles.tableColHeader, pdfStyles.colSrNo]}>
                      क्र. क.
                    </Text>
                    <Text
                      style={[
                        pdfStyles.tableColHeader,
                        pdfStyles.colInformation,
                      ]}
                    >
                      प्रतिष्ठान माहिती
                      {"\n"}
                      व्यवसायाचे नाव
                      {"\n"}
                      मालकाचे नाव
                      {"\n"}
                      मोबईल क्र.
                      {"\n"}ई-मेल
                    </Text>
                    <Text
                      style={[
                        pdfStyles.tableColHeader,
                        pdfStyles.colLicenseType,
                      ]}
                    >
                      नवीन परवाना /{"\n"}नूतनीकरण
                    </Text>
                    <Text
                      style={[
                        pdfStyles.tableColHeader,
                        pdfStyles.colLicensePeriod,
                      ]}
                    >
                      परवाना कालावधी
                    </Text>
                    <Text
                      style={[pdfStyles.tableColHeader, pdfStyles.colReceiptNo]}
                    >
                      पावती क्रमांक
                    </Text>
                    <Text
                      style={[
                        pdfStyles.tableColHeader,
                        pdfStyles.colReceiptDate,
                      ]}
                    >
                      पावती
                      {"\n"}दिनांक
                    </Text>
                    <Text
                      style={[
                        pdfStyles.tableColHeader,
                        pdfStyles.colTransactionAmount,
                      ]}
                    >
                      व्यवहार
                      {"\n"}रक्कम
                    </Text>
                  </View>

                  {/* Data Rows for the current chunk */}
                  {chunk.map((item, index) => (
                    <View
                      style={pdfStyles.tableRow}
                      key={item.TRANS_NO || index}
                    >
                      <Text style={[pdfStyles.tableCol, pdfStyles.colSrNo]}>
                        {/* Calculate global S.No based on page index and rows per page */}
                        {pageIndex * rowsPerPage + index + 1}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCol, pdfStyles.colInformation]}
                      >
                        {item.INFORMATION || ""}
                        {"\n"}
                        {item.PLACEOWNER_NAME || ""}
                        {"\n"}
                        {item.MOBILENO || ""}
                        {"\n"}
                        {item.EMAIL || ""}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCol, pdfStyles.colLicenseType]}
                      >
                        {item.APPLICATION_TYPE || ""}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCol, pdfStyles.colLicensePeriod]}
                      >
                        {formatDateForPdf(item.FORM_LICENSE_DATE) || ""} ते
                        {"\n"}
                        {formatDateForPdf(item.LICENSE_DATE) || ""}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCol, pdfStyles.colReceiptNo]}
                      >
                        {item.TRANS_NO || ""}
                      </Text>
                      <Text
                        style={[pdfStyles.tableCol, pdfStyles.colReceiptDate]}
                      >
                        {formatDateForPdf(item.TRANS_DATE) || ""}
                      </Text>
                      <Text
                        style={[
                          pdfStyles.tableCol,
                          pdfStyles.colTransactionAmount,
                        ]}
                      >
                        {item.AMOUNT || ""}
                      </Text>
                    </View>
                  ))}

                  {/* Total amount row - only render on the very last page */}
                  {pageIndex === dataChunks.length - 1 && (
                    <View
                      style={[
                        pdfStyles.tableRow,
                        { backgroundColor: "#f9f9f9" },
                      ]}
                    >
                      {/* Cell for "Total Amount" label spanning multiple columns */}
                      <Text style={pdfStyles.totalLabelCol}>एकूण :</Text>
                      {/* Cell for the total amount value */}
                      <Text style={pdfStyles.totalAmountCol}>
                        {totalAmount.toFixed(2)}{" "}
                        {/* Format to 2 decimal places */}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Footer text (will appear on each page, fixed position) */}
              <Text style={pdfStyles.footerText} fixed>
                Date {currentPrintDate} Page No {pageIndex + 1} of{" "}
                {totalPagesInDoc}
              </Text>
            </>
          )}
        />
      ))}
    </Document>
  );
};

export default FrmChallanReportPDF;
