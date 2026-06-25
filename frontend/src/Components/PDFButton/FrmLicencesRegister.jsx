import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "NotoSansDevanagari",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  titleMain: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  titleSub: {
    fontSize: 10,
    textAlign: "center",
  },
  reportTitle: {
    textAlign: "center",
    fontSize: 14,
    marginVertical: 5,
  },
  Prabhag: {
    textAlign: "right",
    fontSize: 14,
    marginVertical: 5,
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    textAlign: "center",
    padding: 4,
    fontWeight: "bold",
    flex: 1,
  },
  tableCol: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    textAlign: "center",
    padding: 4,
    flex: 1,
  },
  licenseNoCol: {
    width: 120,
    minHeight: 20,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    flexWrap: "wrap",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
  },
  licenseNoCell: {
    width: 120,
    minHeight: 20,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    flexWrap: "wrap",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 10,
    left: 20,
    fontSize: 8,
  },
});

const FrmLicencesRegister = ({
  logo,
  companyName,
  data,
  FromDt,
  ToDt,
  Prabhag,
}) => {
  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const currentDate = formatDate(new Date());

  return (
    <Document>
      <Page size="A3" orientation="landscape" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {logo && <Image src={logo} style={styles.logo} />}
          <View style={styles.headerTitle}>
            <Text style={styles.titleMain}>{companyName}</Text>
            <Text style={styles.titleSub}>परवाना विभाग</Text>
          </View>
        </View>

        <Text style={styles.reportTitle}>
          Report From : {FromDt} To: {ToDt}
        </Text>
        <Text style={styles.Prabhag}>प्रभाग : {data[0]?.ZONENAME}</Text>

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Sr No.</Text>
            <Text style={styles.licenseNoCol}>License No</Text>
            <Text style={styles.tableColHeader}>License Type</Text>
            <Text style={styles.tableColHeader}>Shop Name</Text>
            <Text style={styles.tableColHeader}>Business Add.</Text>
            <Text style={styles.tableColHeader}>Proprietor Name</Text>
            <Text style={styles.tableColHeader}>Pro. Address</Text>
            <Text style={styles.tableColHeader}>Trade Category</Text>
            <Text style={styles.tableColHeader}>Mobile No.</Text>
            <Text style={styles.tableColHeader}>From Date</Text>
            <Text style={styles.tableColHeader}>To Date</Text>
            <Text style={styles.tableColHeader}>Renewal Date</Text>
            <Text style={styles.tableColHeader}>Fees</Text>
          </View>

          {/* Table Body */}
          {data.map((item, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{index + 1}</Text>
              <Text style={styles.licenseNoCell}>{item.LICENSENO}</Text>
              <Text style={styles.tableCol}>{item.LICENSETYPE}</Text>
              <Text style={styles.tableCol}>{item.SHOPNAME}</Text>
              <Text style={styles.tableCol}>{item.ADDRESS}</Text>
              <Text style={styles.tableCol}>{item.PROPRIETORNAME}</Text>
              <Text style={styles.tableCol}>{item.PROPRIETORADDRESS}</Text>
              <Text style={styles.tableCol}>{item.BUSINESSTYPE}</Text>
              <Text style={styles.tableCol}>{item.MOBILENO}</Text>
              <Text style={styles.tableCol}>{formatDate(item.FROMDATE)}</Text>
              <Text style={styles.tableCol}>{formatDate(item.TODATE)}</Text>
              <Text style={styles.tableCol}>
                {formatDate(item.RENEWALDATE)}
              </Text>
              <Text style={styles.tableCol}>{item.APPLICATIONAMOUNT}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Date: {currentDate} | Total Records: {data.length}
        </Text>
      </Page>
    </Document>
  );
};

export default FrmLicencesRegister;
