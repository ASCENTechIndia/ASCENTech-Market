
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
    marginBottom: 10,
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
  municipalityInfo: {
    fontSize: 8,
    textAlign: 'left',
    marginTop: 5, 
  },
  titleBlock: {
    flex: 1, 
    alignItems: "center",
    textAlign: "center",
    marginHorizontal: 10,
  },
  municipalityName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  title: {
    fontSize: 12, 
    fontWeight: "bold",
    marginTop: 5,
  },
  subheader: {
    fontSize: 10,
    marginTop: 2,
  },
  datePageBlock: {
    fontSize: 8,
    marginTop: 0, 
    width: '20%', 
    marginTop: 40,
    alignItems: 'flex-end', // Align text to the right
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTop: "1 solid #000", 
    borderLeft: "1 solid #000", 
    borderRight: "1 solid #000", 
    borderBottom: "1 solid #000", 
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderLeft: "1 solid #000",
    borderRight: "1 solid #000",
    borderBottom: "1 solid #000", 
  },
  // Column styles with explicit widths to match the image's visual proportions
  colSrNo: {
    width: '5%', 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  colRegNo: {
    width: '15%', 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  colSanctionDate: {
    width: '15%', 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  colShopName: {
    width: '25%',
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "left",
  },
  colOwnerName: {
    width: '25%', 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "left", 
  },
  colRegDate: {
    width: '15%', 
    padding: 4,
    textAlign: "center", 
  },
  bold: {
    fontWeight: "bold",
  },
  line: {
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
  },
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
            <Text style={styles.municipalityName}>IN USE {companyName}</Text> {/* Using companyName as Municipality name */}
            <Text style={styles.title}>नमुना आय</Text>
            <Text style={styles.subheader}>( पहा कलम ६(१)(२)८ आणि नियम ९)</Text>
            <Text style={styles.subheader}>बाजार नोंदवही सन {currentFinancialYear}</Text> {/* Changed to बाजार नोंदवही */}
          </View>

          {/* Date, Time, Page Block */}
          <View style={styles.datePageBlock}>
            <Text>Date/दिनांक : {moment().format("DD/MM/YYYY")}</Text>
            <Text>Time/वेळ : {moment().format("hh:mm A")}</Text>
            <Text>Page/पान : Page 1 of 1</Text> {/* Hardcoded for now, can be dynamic if multiple pages */}
          </View>
        </View>

        {/* Horizontal Line and Rajpatra Text */}
        <View>
          <Text style={styles.line}></Text>
          <Text style={{ textAlign: "center" }}>
            (भाग चार - ब) महाराष्ट्र शासन राजपत्र मे. २०, १९९९ वैशाख ३०, शके १९२२१
          </Text>
        </View>

        {/* Date Range and Ward */}
        <View style={styles.infoRow}>
          <Text>दिनांक पासुनः {moment(fromDate, "DD/MM/YYYY").format("DD-MMM-YYYY")}</Text>
          <Text>वॉर्ड : {ward}</Text> {/* Added Ward */}
          <Text>दिनांक पर्यंतः {moment(toDate, "DD/MM/YYYY").format("DD-MMM-YYYY")}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.colSrNo}>अ.क्र.</Text> {/* Serial No */}
          <Text style={styles.colRegNo}>नोंदणी क्र.</Text> {/* Application ID */}
          <Text style={styles.colSanctionDate}>मंजूरी दिनांक</Text> {/* Sanction Date - using INSDATE */}
          <Text style={styles.colShopName}>दुकानाचे नाव</Text> {/* Shop Name - mapping to PURPOSE */}
          <Text style={styles.colOwnerName}>मालकाचे नाव</Text> {/* Owner Name - mapping to APPNAME */}
          <Text style={styles.colRegDate}>नोंदणी दिनांक</Text> {/* Registration Date - using INSDATE */}
        </View>

        {/* Table Rows */}
        {data.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colSrNo}>{index + 1}</Text> {/* Serial No */}
            <Text style={styles.colRegNo}>{item.APPLINO}</Text> {/* Mapped to APPLINO */}
            <Text style={styles.colSanctionDate}>
              {moment(item.INSDT).format("DD/MM/YYYY")} {/* Mapped to INSDT */}
            </Text>
            <Text style={styles.colShopName}>{item.SHOPNAME}</Text> {/* Mapped to SHOPNAME */}
            <Text style={styles.colOwnerName}>{item.PLACEOWNERNAME}</Text>{" "} {/* Mapped to PLACEOWNERNAME */}
            <Text style={styles.colRegDate}>
              {moment(item.INSDT).format("DD/MM/YYYY")} {/* Mapped to INSDT */}
            </Text>
          </View>
        ))}

        {/* Footer - No specific footer content in the image, so keeping it simple */}
      </Page>
    </Document>
  );
};

export default GenerateTapshilFireReport;
