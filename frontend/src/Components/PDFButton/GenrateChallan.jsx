import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font, // Import Font for registering
} from "@react-pdf/renderer";

// Register NotoSansDevanagari font
// You'll need to make sure the font file is accessible.
// For example, if you have 'NotoSansDevanagari-Regular.ttf' in your public folder:
Font.register({
  family: "NotoSansDevanagari",
  src: "/fonts/NotoSansDevanagari-Regular.ttf", // Adjust path as necessary
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "NotoSansDevanagari", // Ensure this font is registered and available
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  container: {
    border: "1 solid #000",
    fontSize: 9,
    paddingTop: 10,
  },
  logo: {
    height: 40,
    paddingLeft: 35,
  },
  titleBlock: {
    flex: 1,
    alignItems: "center",
    textAlign: "center",
    marginHorizontal: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  col: {
    flex: 1,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "left",
  },
  bold: {
    fontWeight: "bold",
  },
  line: {
    border: "1 solid #000",
  },
  first: {
    width: 348,
    padding: 15,
    borderRight: "1 solid #000",
    textAlign: "center",
    fontWeight: "bold",
  },
  second: {
    width: 450,
    padding: 2,
    borderRight: "1 solid #000",
    textAlign: "center",
    fontWeight: "bold",
  },
  distance: {
    padding: 20,
  },
  last: {
    width: 450,
    padding: 20,
    borderRight: "1 solid #000",
    textAlign: "center",
    fontWeight: "bold",
  },
  smallTableContainer: {
    width: 300,
    marginTop: 20,
    border: "1 solid #000",
    alignSelf: "left",
  },
  smallTableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  smallCell: {
    width: 100,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "left",
  },
  rightText: {
    alignSelf: "flex-end",
    position: "absolute",
    top: 0,
    right: 0,
  },
  fonts: {
    textAlign: "left",
    marginTop: 5,
    padding: 5,
  },
  text: {
    textAlign: "right",
    paddingRight: 4,
  },
  topRightText: {
    textAlign: "right",
    paddingBottom: 20,
  },
  // New styles for dynamic service rows
  serviceRow: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
  },
  serviceNameCell: {
    flex: 1, // Takes up remaining space
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "left", // Align service name to left
  },
  serviceAmountCell: {
    width: 150, // Fixed width for amount column
    padding: 4,
    textAlign: "right", // Align amount to right
  },
});

const formatDate = (date) => {
  if (!date) return "";
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  return `${day}/${month}/${year}`;
};

const GenrateChallan = ({ companyName, logo, data, username }) => {
  // Aggregate data by service name
  const aggregatedData = data.reduce((acc, item) => {
    const serviceName = item.SERVICENAME || "Unknown Service";
    if (!acc[serviceName]) {
      acc[serviceName] = 0;
    }
    acc[serviceName] += item.RECEIVEAMOUNT || 0;
    return acc;
  }, {});

  const totalAmount = Object.values(aggregatedData).reduce(
    (sum, amount) => sum + amount,
    0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.container}>
          <View style={styles.header}>
            <Image src={logo} style={styles.logo} />
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{companyName}</Text>
              <Text style={styles.subTitle}>
                General Receipt Challan Report
              </Text>
              <Text style={styles.subTitle}>नमुना नं. १३ </Text>
              <Text style={styles.subTitle}> {data[0]?.PRABHAG}</Text>
            </View>
          </View>
          <Text style={styles.line}></Text>
          <View style={styles.tableRow}>
            <Text style={styles.first}>
              नियम ३३ (ने), ६५.७०(२),७३(५),७८(३),९७(५) आणि १०७ ने लेखा विभागामधे
              पैसे भरण्यासाठी चलन{" "}
            </Text>
            <Text style={styles.col}>चलन क्र.{"\n"} दिनांक</Text>{" "}
            {/* Challan Number and Date label with line break */}
            <Text style={styles.col}>
              {data[0]?.CHALLANNUMBER}
              {"\n"}
              {formatDate(data[0]?.RECEIPTDATE)}
            </Text>{" "}
            {/* Displaying Challan Number and Date */}
          </View>

          {/* Table Header for Service Names */}
          <View style={styles.tableRow}>
            <Text
              style={[
                styles.second,
                styles.bold,
                { textAlign: "center", paddingLeft: 4 },
              ]}
            >
              सेवेचे नाव
            </Text>{" "}
            {/* Align left */}
            <Text style={[styles.col, { textAlign: "right" }]}>
              एकूण जमा रक्कम
            </Text>{" "}
            {/* Align right */}
          </View>

          {/* Dynamically rendered service rows */}
          {Object.entries(aggregatedData).map(([serviceName, amount]) => (
            <View key={serviceName} style={styles.tableRow}>
              <Text style={styles.second}>{serviceName}</Text>
              <Text style={styles.col}>₹ {amount.toFixed(2)}</Text>
            </View>
          ))}

          <View style={styles.tableRow}>
            <Text style={[styles.second, styles.text]}>एकूण जमा रक्कम</Text>
            <Text style={styles.col}> ₹ {totalAmount.toFixed(2)}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.second, styles.distance]}>
              पडताळणी व महानगरपालिका निधी मध्ये जमा करण्यासाठी रुपये जमा केले
              {"\n"}
              <Text style={styles.topRightText}>कम्प्यूटर पावती</Text>
            </Text>

            <Text
              style={[
                styles.col,
                styles.fonts,
                { textAlign: "center", paddingLeft: 4 },
              ]}
            >
              रक्कम घेणारा{"\n"} {"\n"} {"\n"} {"\n"}लिपिक {"\n"}{" "}
              <Text>{username}</Text>
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.last}>
              तपासले आणि वसूली नोंदवहीतील बेरजेशी जुळते. त्यातील नोंद
              पावत्याच्या दुसऱ्या प्रतिशी पडताळून पाहिल्या होत्या.{"\n"}अधीक्षक
              /निरीक्षक
            </Text>
            <Text style={styles.col}>
              रोख रक्कम मिळाली,{"\n"} तपासले आणि नोंद घेतली.{"\n"}
              {"\n"} शेखपाल लेखपाल
            </Text>
          </View>
        </View>

        <View style={styles.smallTableContainer}>
          {/* Table Header */}
          <View style={styles.smallTableRow}>
            <Text style={styles.smallCell}>चलन (रूपये / पैसे)</Text>
            <Text style={styles.smallCell}>नगदी नोटा / नाणी</Text>
            <Text style={styles.smallCell}>एकूण रक्कम</Text>
          </View>

          {/* Table Rows */}
          {[
            "2000",
            "500",
            "200",
            "100",
            "50",
            "20",
            "10",
            "5",
            "Other Coins",
          ].map((denomination, idx) => (
            <View key={idx} style={styles.smallTableRow}>
              <Text style={styles.smallCell}>{denomination}</Text>
              <Text style={styles.smallCell}>X</Text>
              <Text style={styles.smallCell}></Text>
            </View>
          ))}

          {/* Total Row */}
          <View style={styles.smallTableRow}>
            <Text style={styles.smallCell}></Text>
            <Text style={styles.smallCell}>एकूण</Text>
            <Text style={styles.smallCell}></Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default GenrateChallan;
