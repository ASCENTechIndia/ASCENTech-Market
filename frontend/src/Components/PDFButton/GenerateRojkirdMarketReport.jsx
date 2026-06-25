import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import moment from "moment";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "NotoSansDevanagari", 
    fontSize: 9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5, 
    alignItems: 'flex-start',
  },
  logoBlock: {
    width: '15%',
    alignItems: 'flex-start',
    paddingTop: 5,
  },
  logo: {
    height: 60,
    width: 60,
    objectFit: 'contain',
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    marginRight: 50,
    paddingTop: 0, 
  },
  modelNumber: {
    fontSize: 10,
    marginBottom: 2,
  },
  ruleReference: {
    fontSize: 8,
    marginBottom: 5,
  },
  municipalityName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 3,
  },
  financialYear: {
    fontSize: 10,
  },
  dateBlock: {
    fontSize: 9,
    width: '20%',
    marginTop: 0, 
    alignItems: 'flex-end', 
  },
  // Added for the line below header and Rajpatra text
  rajpatraContainer: {
    marginBottom: 10,
  },
  line: {
    marginTop: 5, 
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
  rajpatraText: {
    textAlign: "center",
    fontSize: 7,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
    fontSize: 9,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTop: "1 solid #000",
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
    borderBottom: "1 solid #000",
    fontWeight: "bold",
    textAlign: "center",
    alignItems: "center", 
    minHeight: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
    borderBottom: "1 solid #000",
    minHeight: 20, 
  },
  
  colSrNo: {
    width: '5%',
    padding: 2,
    borderRight: "1 solid #000",
    textAlign: "center",
    justifyContent: "center", 
  },
  colDate: {
    width: '12%', 
    padding: 2,
    borderRight: "1 solid #000",
    textAlign: "center",
    justifyContent: "center",
  },
  colReceiptNo: {
    width: '12%', 
    padding: 2,
    borderRight: "1 solid #000",
    textAlign: "center",
    justifyContent: "center",
  },
  colApplicantName: {
    width: '35%', 
    padding: 2,
    borderRight: "1 solid #000",
    textAlign: "left",
    justifyContent: "center",
  },
  colAmount: {
    width: '12%', 
    padding: 2,
    borderRight: "1 solid #000",
    textAlign: "right", 
    justifyContent: "center",
  },
  colRemarks: {
    width: '24%',
    padding: 2,
    textAlign: "left",
    justifyContent: "center",
  },
  totalRow: {
    flexDirection: "row",
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
    borderBottom: "1 solid #000",
    minHeight: 20,
    backgroundColor: "#f0f0f0", 
  },
  totalLabelCell: {
    width: '74%', 
    padding: 2,
    textAlign: "right",
    justifyContent: "center",
    fontWeight: "bold",
    borderRight: "1 solid #000",
  },
  totalAmountCell: {
    width: '12%',
    padding: 2,
    textAlign: "right",
    justifyContent: "center",
    fontWeight: "bold",
    borderRight: "1 solid #000",
  },
  totalRemarksCell: {
    width: '14%', 
    padding: 2,
    textAlign: "left",
    justifyContent: "center",
  },
  signatureContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 50, 
    width: '100%',
    paddingHorizontal: 20, 
  },
  signatureText: {
    fontSize: 10,
    fontWeight: "bold",
  }
});

const getFinancialYear = (date) => {
  const year = moment(date).year();
  const nextYear = (year + 1).toString().slice(-2);
  return `${year}-${nextYear}`;
};

const GenerateTapshilFireReport = ({
  companyName, 
  logo,
  data, 
  fromDate,
  toDate,
  ward = "Ho", 
}) => {
  const currentFinancialYear = getFinancialYear(new Date());

  // Calculate total amount - assuming 'AMOUNT' field exists in 'data' objects
  const totalAmount = data.reduce((sum, item) => sum + (item.AMOUNT || 0), 0).toFixed(2);

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo Block */}
          <View style={styles.logoBlock}>
            <Image src={logo} style={styles.logo} />
          </View>

          {/* Title Block */}
          <View style={styles.titleBlock}>
            <Text style={styles.modelNumber}>नमुना क्र . ५०</Text>
            <Text style={styles.ruleReference}>नियम ७८ ( ३ ) पहा</Text>
            <Text style={styles.municipalityName}>IN USE {companyName}, भिवंडी</Text>
            <Text style={styles.financialYear}>सन {currentFinancialYear} या वर्षासाठी नोंदणीची रोज किर्द</Text>
          </View>
        </View>

        {/* Date Range and Ward */}
        <View style={styles.infoRow}>
          <Text>वॉर्ड : {ward}</Text> 
          <Text></Text> 
          <Text>दिनांक : {moment().format("DD/MM/YYYY")}</Text> 
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.colSrNo}>अ.क्र.</Text>
          <Text style={styles.colDate}>दिनांक</Text>
          <Text style={styles.colReceiptNo}>पावतीचा क्र.</Text>
          <Text style={styles.colApplicantName}>अर्जदाराचे नाव</Text>
          <Text style={styles.colAmount}>पावतीची रक्कम</Text>
          <Text style={styles.colRemarks}>शेरा</Text>
        </View>

        {/* Table Rows */}
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colSrNo}>{index + 1}</Text>
            <Text style={styles.colDate}>
              {moment(item.RECIEPTINSDATE).format("DD/MM/YYYY")} {/* Mapped to RECIEPTINSDATE */}
            </Text>
            <Text style={styles.colReceiptNo}>{item.RECIEPTNUMBER}</Text> {/* Mapped to RECIEPTNUMBER */}
            <Text style={styles.colApplicantName}>{item.NAME}</Text> {/* Mapped to NAME */}
            <Text style={styles.colAmount}>{(item.AMOUNT || 0).toFixed(2)}</Text>
            <Text style={styles.colRemarks}></Text> {/* Placeholder for 'शेरा' */}
          </View>
        ))}

        {/* Total Row */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabelCell}>एकूण रक्कम</Text>
          <Text style={styles.totalAmountCell}>{totalAmount}</Text>
          <Text style={styles.totalRemarksCell}></Text> {/* Empty for remarks column */}
        </View>

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureText}>लिपीक</Text>
          <Text style={styles.signatureText}>रोखपाल</Text>
          <Text style={styles.signatureText}>लेखापाल</Text>
        </View>
      </Page>
    </Document>
  );
};

export default GenerateTapshilFireReport;