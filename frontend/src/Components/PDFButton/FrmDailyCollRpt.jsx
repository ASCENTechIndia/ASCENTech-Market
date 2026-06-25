import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "NotoSansDevanagari",
    fontSize: 10,
    lineHeight: 1.2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    height: 40,
    width: 40,
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
    fontWeight: "bold",
  },
  municipalName: {
    fontSize: 10,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
    marginTop: 3,
  },
  dateRange: {
    fontSize: 9,
    textAlign: "center",
    marginBottom: 5,
    marginTop: 5,
  },
  prabhag: {
    fontSize: 9,
    textAlign: "right",
    marginBottom: 10,
  },
  table: {
    width: "100%",
    border: "1 solid #000",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  tableColHeader: {
    flex: 1, // Equal width for all header columns
    padding: 5,
    fontWeight: "bold",
    borderRight: "1 solid #000",
    textAlign: "center",
    fontSize: 7,
  },
  tableCol: {
    flex: 1, // Equal width for all data columns
    padding: 5,
    borderRight: "1 solid #000",
    textAlign: "center",
    fontSize: 7,
    flexWrap: "wrap",
  },
  lastColBorderNone: {
    borderRight: "none",
  },
  totalRow: {
    flexDirection: "row",
    borderTop: "1 solid #000",
    borderBottom: "1 solid #000",
    padding: 5,
  },
  totalLabelCol: {
    width: "90%", // Combines the width of first 6 columns
    padding: 5,
    textAlign: "right",
    fontWeight: "bold",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 0, // Important: remove right border for merging
  },
  totalAmountCol: {
    width: "10%", // Matches the width of colTransactionAmount
    padding: 5,
    textAlign: "center",
    fontWeight: "bold",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 1, // Important: add left border to separate from label
    borderTopWidth: 0,
  },
});

// Date formatter
const formatDate = (isoString) => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return "";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Error formatting date:", isoString, e);
    return "";
  }
};

// Main PDF component
const FrmDailyCollRptPDF = ({ companyName, logo, data }) => {
  const reportData = Array.isArray(data) ? data : [];
  const totalFees = reportData.reduce(
    (sum, row) => sum + (row.APPLI_RECAMOUNT || 0),
    0
  );

  // Determine report-wide information from the first data entry, if available
  const fromDate = reportData[0]?.FROMDT;
  const toDate = reportData[0]?.TODT;
  const zoneName = reportData[0]?.ZONENAME || "";

  // Define how many rows per page
  const ROWS_PER_PAGE = 13;
  const totalPages = Math.ceil(reportData.length / ROWS_PER_PAGE);

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => {
        const startIndex = pageIndex * ROWS_PER_PAGE;
        const endIndex = Math.min(
          startIndex + ROWS_PER_PAGE,
          reportData.length
        );
        const currentPageData = reportData.slice(startIndex, endIndex);
        const isLastPage = pageIndex === totalPages - 1;

        return (
          <Page size="A4" style={styles.page} key={`page-${pageIndex}`}>
            {/* Header for each page */}
            <View style={styles.header}>
              {logo && <Image src={logo} style={styles.logo} />}
              <View style={styles.titleBlock}>
                <Text style={styles.companyName}>{companyName}</Text>
              </View>
            </View>

            <Text style={styles.reportTitle}>Daily Collection Report</Text>
            <Text style={styles.dateRange}>
              From Date : {formatDate(fromDate)} To Date : {formatDate(toDate)}
            </Text>
            <Text style={styles.prabhag}>प्रभाग क्र. : {zoneName}</Text>

            {/* Table */}
            <View style={styles.table}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableColHeader}>Sr No.</Text>
                <Text style={styles.tableColHeader}>Shop Name</Text>
                <Text style={styles.tableColHeader}>Business Address</Text>
                <Text style={styles.tableColHeader}>Proprietor Name</Text>
                <Text style={styles.tableColHeader}>Trade Category</Text>
                <Text style={styles.tableColHeader}>License Type</Text>
                <Text style={styles.tableColHeader}>
                  Payment for from date to date
                </Text>
                <Text style={styles.tableColHeader}>Receipt no</Text>
                <Text style={styles.tableColHeader}>Receipt Date</Text>
                <Text style={[styles.tableColHeader, styles.lastColBorderNone]}>
                  Fees
                </Text>
              </View>

              {/* Table Rows */}
              {currentPageData.length > 0
                ? currentPageData.map((row, index) => (
                    <View style={styles.tableRow} key={index}>
                      <Text style={styles.tableCol}>
                        {startIndex + index + 1}
                      </Text>{" "}
                      {/* Global Sr No. */}
                      <Text style={styles.tableCol}>{row.SHOPNAME || ""}</Text>
                      <Text style={styles.tableCol}>{row.ADDRESS || ""}</Text>
                      <Text style={styles.tableCol}>
                        {row.PROPRIETOR_NAME || ""}
                      </Text>
                      <Text style={styles.tableCol}>
                        {row.BUSINESS_TYPE || ""}
                      </Text>
                      <Text style={styles.tableCol}>
                        {row.LICENSE_TYPE || ""}
                      </Text>
                      <Text style={styles.tableCol}>
                        {`${formatDate(row.FROMDT)} TO ${formatDate(row.TODT)}`}
                      </Text>
                      <Text style={styles.tableCol}>
                        {row.APPLI_RECNO || ""}
                      </Text>
                      <Text style={styles.tableCol}>
                        {formatDate(row.APPLI_RECDATE)}
                      </Text>
                      <Text style={[styles.tableCol, styles.lastColBorderNone]}>
                        {row.APPLI_RECAMOUNT
                          ? row.APPLI_RECAMOUNT.toFixed(2)
                          : "0.00"}
                      </Text>
                    </View>
                  ))
                : // Only show "No data" if there's no data at all on the first page
                  pageIndex === 0 && (
                    <View style={styles.tableRow}>
                      <Text
                        style={[
                          styles.tableCol,
                          { flex: 10, borderRight: "none" },
                        ]}
                      >
                        No data available for this report.
                      </Text>
                    </View>
                  )}

              {isLastPage && (
                <View style={[styles.tableRow, { backgroundColor: "#f9f9f9" }]}>
                  <Text style={styles.totalLabelCol}>TOTAL</Text>
                  <Text style={styles.totalAmountCol}>
                    {totalFees.toFixed(2)} {/* Format to 2 decimal places */}
                  </Text>
                </View>
              )}
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default FrmDailyCollRptPDF;
