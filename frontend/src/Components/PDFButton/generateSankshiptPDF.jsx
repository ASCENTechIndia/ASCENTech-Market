
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
// At the top of generateSankshiptPDF.jsx
import { marathiNumberToWords } from "../../utils/marathiNumberUtils";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "NotoSansDevanagari",
    fontSize: 9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 10,
  },
  container: {
    border: "1 solid #000",
    fontSize: 9,
  },
  logo: {
    height: 40,
    width: 40, // Adjust width as needed for your logo
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    marginHorizontal: 10,
    marginTop: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 12,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderTop: "1 solid #000",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  col: {
    flex: 1,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  smallCol: {
    flex: 0.6,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  amountCol: {
    flex: 0.8,
    padding: 4,
    textAlign: "left", 
    borderRight: "1 solid #000",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    paddingRight: 10,
  },
  totalText: {
    fontWeight: "bold",
    fontSize: 10,
  },
  footerColumn: {
    marginTop: 30,
    marginLeft: 30,
    fontWeight: "bold",
    textAlign: "right",
  },
  footerColumn1: {
    marginTop: 30,
    paddingLeft: 20,
    fontWeight: "bold",
    textAlign: "left",
  },
  bold: {
    fontWeight: "bold",
  },
  space: {
    padding: 5,
  },
  line: {
    borderBottom: "0.5 solid #000",
  },
  tableColReceiptNo: {
    flex: 1.2, 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  tableColReceiptDate: {
    flex: 0.8, 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  tableColAmount: {
    flex: 0.7, 
    padding: 4,
    textAlign: "right",
    borderRight: "1 solid #000",
  },
  tableColName: {
    flex: 1.5, 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  tableColPaymentType: {
    flex: 0.8, 
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  tableColDescription: {
    flex: 1.2,
    padding: 4,
    textAlign: "center",
  },
  wardCollectionCenterText: {
    paddingLeft: 5, 
    marginBottom: 5,
    fontWeight: "bold",
  },
});

const generateSankshiptReport = ({
  companyName,
  logo,
  data,
  fromDate,
  toDate,
}) => {
  const totalAmount = data.reduce((sum, item) => sum + Number(item.AMOUNT), 0);
  const ward = "Ho"; 
  const collectionCenter = "वसूली केंद्र"; 

  return (
    <Document>
      <Page size="A4" orientation="portrait" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src={logo} style={styles.logo} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{companyName}</Text>
            <Text style={styles.subTitle}>
              वसुली केंद्र / खिडकीनुसार पावत्यांचे चलन
            </Text>
          </View>
          <View style={{ fontSize: 8, marginTop: 40, marginRight: 20 }}>
            <Text>
              <Text style={styles.bold}>दिनांक: </Text>
              {moment().format("DD/MM/YYYY") + "\n"} {/* Changed format to match image */}
              <Text style={styles.bold}>Time/वेळ: </Text>
              {moment().format("h:mm A") + "\n"} {/* Changed format to match image */}
              <Text style={styles.bold}>Page/पृष्ठ: </Text>Page 1 of 1
            </Text>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.infoRow}>
          <Text style={styles.bold}>
            दिनांक पासून : {moment(fromDate, "DD/MM/YYYY").format("DD-MMM-YYYY")}
          </Text>
          <Text style={styles.bold}>
            दिनांक पर्यंत : {moment(toDate, "DD/MM/YYYY").format("DD-MMM-YYYY")}
          </Text>
        </View>

        <View style={styles.container}>
          {/* Ward and Collection Center */}
          <Text style={styles.wardCollectionCenterText}>वॉर्ड : {ward}</Text>
          <View style={styles.line} />
          <Text style={styles.wardCollectionCenterText}>वसूली केंद्र : {collectionCenter}</Text>
          <View style={styles.line} />

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableColReceiptNo}>विभाग पावती क्र./मॅन्युअलपावती क्र. </Text>
            <Text style={styles.tableColReceiptNo}>
              वसुली केंद्र पावती क्र. / खिडकी पावती क्र.{" "}
            </Text>
            <Text style={styles.tableColReceiptDate}>पावती दिनांक </Text>
            <Text style={styles.tableColAmount}>पावती रक्कम </Text>
            <Text style={styles.tableColName}>पावती भरणाऱ्याचे नाव </Text>
            <Text style={styles.tableColPaymentType}>देयकाचा प्रकार </Text>
            <Text style={styles.tableColDescription}>विवरण </Text>
          </View>

          {/* Table Rows */}
          {data.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.tableColReceiptNo}>{item.RECEIPTNO}</Text>
              <Text style={styles.tableColReceiptNo}>{item.RECEIPTNO}</Text>
              <Text style={styles.tableColReceiptDate}>
                {moment(item.RECEIPTINSDATE).format("DD-MM-YYYY")}
              </Text>
              <Text style={styles.tableColAmount}>
                {Number(item.AMOUNT).toFixed(2)}
              </Text>
              <Text style={styles.tableColName}>{item.NAME}</Text>
              <Text style={styles.tableColPaymentType}>{item.RECMODENAME}</Text>
              <Text style={styles.tableColDescription}>बाजार प्रमाणपत्र </Text> {/* As per image */}
            </View>
          ))}

          {/* Total and Footer Sections */}
          <View style={styles.tableRow}>
            <Text style={[styles.col, { flex: 4, textAlign: 'center', borderRight: 'none', paddingRight: 10 }]}>Total :</Text>
            <Text style={[styles.amountCol, { borderRight: 'none' }]}>{totalAmount.toFixed(2)}</Text>
            <Text style={[styles.col, { flex: 2, borderRight: 'none' }]}></Text>
            <Text style={[styles.col, { flex: 1, borderRight: 'none' }]}></Text>
            <Text style={[styles.col, { flex: 1, borderRight: 'none' }]}></Text>
          </View>

          <View style={styles.line} />

          <View style={styles.tableRow}>
            <Text style={[styles.col, { flex: 4, textAlign: 'center', borderRight: 'none', paddingRight: 10 }]}>एकुण बेरीज:</Text>
            <Text style={[styles.amountCol, { borderRight: 'none' }]}>{totalAmount.toFixed(2)}</Text>
            <Text style={[styles.col, { flex: 2, borderRight: 'none' }]}></Text>
            <Text style={[styles.col, { flex: 1, borderRight: 'none' }]}></Text>
            <Text style={[styles.col, { flex: 1, borderRight: 'none' }]}></Text>
          </View>
          <View style={styles.line} />

          <View style={styles.tableRow}>
            <Text style={[styles.col, { textAlign: 'center', borderRight: 'none', paddingRight: 10 }]}>अक्षरी एकुण रक्कम रु:</Text>
            <Text style={[styles.amountCol, {flex: 2, borderRight: 'none' }]}>{marathiNumberToWords(totalAmount)}</Text>
          </View>

          <View style={styles.line} />

          {/* Footer Signatures */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 40,
            }}
          >
            {/* Left Side - रोखपाल */}
            <View style={{ alignItems: "flex-start", marginLeft: 15 }}>
              <Text
                style={{ fontWeight: "bold", fontSize: 12, marginLeft: 30 }}
              >
                रोखपाल
              </Text>
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                IN USE भिवंडी-निजामपूर
              </Text>
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                महानगरपालिका, भिवंडी
              </Text>
            </View>

            {/* Right Side - H.O.D */}
            <View
              style={{
                alignItems: "flex-end",
                justifyContent: "center",
                marginRight: 15,
              }}
            >
              <Text
                style={{ fontWeight: "bold", fontSize: 12, marginRight: 60 }}
              >
                H.O.D
              </Text>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 12,
                  marginRight: 50,
                }}
              >
                बाजार नोंदणी
              </Text>
              <Text
                style={{ fontWeight: "bold", fontSize: 12, marginBottom: 30 }}
              >
                IN USE भिवंडी-निजामपूर महानगरपालिका, भिवंडी
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default generateSankshiptReport;
