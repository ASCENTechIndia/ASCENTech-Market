// import {
//   Document,
//   Page,
//   Text,
//   View,
//   StyleSheet,
//   Image,
// } from "@react-pdf/renderer";
// import moment from "moment";
// import { marathiNumberToWords } from "../../utils/marathiNumberUtils";
// const styles = StyleSheet.create({
//   page: {
//     padding: 20,
//     fontFamily: "NotoSansDevanagari",
//     fontSize: 10,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   container: {
//     border: "1 solid #000",
//     fontSize: 9,
//     paddingTop: 10,
//   },
//   containerCustomer: {
//     border: "1 solid #000",
//     fontSize: 9,
//     paddingTop: 10,
//     marginTop: 10,
//   },
//   logo: {
//     height: 40,
//     paddingLeft: 35,
//   },
//   titleBlock: {
//     flex: 1,
//     alignItems: "center",
//     textAlign: "center",
//     marginHorizontal: 10,
//   },
//   title: {
//     fontSize: 14,
//     fontWeight: "bold",
//   },
//   subTitle: {
//     fontSize: 10,
//   },

//   tableRow: {
//     flexDirection: "row",
//     borderBottom: "1 solid #000",
//   },

//   tableRow1: {
//     flexDirection: "row",
//     borderBottom: "1 solid #000",
//     height: 50,
//     padding: 4,
//   },

//   col: {
//     flex: 1,
//     padding: 4,
//     borderRight: "1 solid #000",
//     textAlign: "center",
//   },

//   bold: {
//     fontWeight: "bold",
//   },

//   line: {
//     border: "1 solid #000",
//   },
//   first: {
//     width: 160,
//     padding: 4,
//     borderRight: "1 solid #000",
//     textAlign: "left",
//   },
//   second: {
//     textAlign: "left",
//   },
//   rscol: {
//     width: 70,
//     padding: 4,
//     borderRight: "1 solid #000",
//     textAlign: "center",
//   },
//   amount: {
//     width: 100,

//     textAlign: "right",
//     paddingRight: 4,
//   },
//   amount1: {
//     width: 100,
//     textAlign: "right",
//     paddingRight: 40,
//   },
//   Details: {
//     width: 250,
//   },
//   Date: {
//     width: 110,
//     textAlign: "center",
//   },
//   formno: {
//     width: 150,
//   },
//   Remark: {
//     textAlign: "left",
//     height: 25,
//     padding: 4,
//   },
//   printBy: {
//     height: 30,
//     padding: 4,
//   },
//   clerk: {
//     textAlign: "left",
//     paddingLeft: 130,
//     marginTop: 10,
//   },
//   contact: {
//     textAlign: "left",
//     marginTop: 5,
//     paddingLeft: 70,
//   },
//   receiptType: {
//     fontSize: 12,
//     marginTop: 30,
//     textAlign: "right",
//     paddingRight: 10,
//   },
//   amtWords: {
//     width: 110,
//     textAlign: "center",
//     padding: 4,
//     borderRight: "1 solid #000",
//   },
//   amtWords1: {
//     width: 250,
//     textAlign: "left",
//     justifySelf: "center",
//     paddingTop: 10,
//     borderRight: "1 solid #000",
//   },
// });

// const getFinancialYear = (date) => {
//   const year = moment(date).year();
//   const nextYear = (year + 1).toString().slice(-2);
//   return `${year}-${nextYear}`;
// };

// const formatDate = (date) => {
//   if (!date) return "";

//   // Ensure it's a Date object
//   const localDate = new Date(date);

//   // Get YYYY-MM-DD in local timezone
//   const year = localDate.getFullYear();
//   const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Month is 0-based
//   const day = String(localDate.getDate()).padStart(2, "0");

//   return `${day}/${month}/${year}`;
// };
// const PrintCollectionReport = ({ companyName, logo, data }) => {
//   const currentFinancialYear = getFinancialYear(new Date());
//   const totalAmount = data.reduce(
//     (sum, item) => sum + (parseFloat(item.AMOUNT) || 0),
//     0
//   );

//   return (
//     <Document>
//       <Page size="A4" style={styles.page}>
//         {/* Header */}
//         <View style={styles.container}>
//           <View style={styles.header}>
//             <Image src={logo} style={styles.logo} />
//             <View style={styles.titleBlock}>
//               <Text style={styles.title}>{companyName}</Text>
//               <Text style={styles.subTitle}>RECEIPT / पावती</Text>
//               <Text> सन {currentFinancialYear}</Text>
//             </View>
//             <View style={styles.receiptType}>
//               <Text>Office Copy/कार्यालय प्रत</Text>
//             </View>
//           </View>
//           <Text style={styles.line}></Text>
//           <View style={styles.tableRow}>
//             <Text style={styles.col}>Receipt No. / पावती क्र.</Text>
//             <Text style={styles.col}>Date / दिनांक</Text>
//             <Text style={styles.col}>परवाना प्रकार</Text>
//             <Text style={styles.col}>परवाना क्र.</Text>
//             <Text style={styles.col}>प्रभाग समिती </Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}> {data[0]?.RECPTNO}</Text>
//             <Text style={styles.col}> {formatDate(data[0]?.RECPTDATE)}</Text>
//             <Text style={styles.col}>नवीन / नुतनीकरण </Text>
//             <Text style={styles.col}>{data[0]?.LICENSENO}</Text>
//             <Text style={styles.col}> {data[0]?.ZONENAME}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>अस्थापनेचे नाव/Shop name</Text>
//             <Text style={[styles.col, styles.second]}>
//               {" "}
//               {data[0]?.SHOPNAMEMAR} {data[0]?.SHOPNAME}
//             </Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>संचालकाचे नाव</Text>
//             <Text style={[styles.col, styles.second]}>
//               {data[0]?.DIRECTOR_NAME}
//             </Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>Narration / विवरण</Text>
//             <Text style={[styles.col, styles.second]}>परवाना प्रमाणपत्र</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>Payment Mode / देयकाचा प्रकार</Text>
//             <Text style={[styles.col, styles.second]}> {data[0]?.PAYMODE}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}>Mode / प्रकार</Text>
//             <Text style={styles.rscol}>Rupees / रुपये</Text>
//             <Text style={styles.col}>Cheque No / धनादेश क्रमांक</Text>
//             <Text style={styles.col}>Cheque Date/धनादेश दिनांक</Text>
//             <Text style={styles.col}>Bank Name / बॅंकेचे नाव</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}> {data[0]?.PAYMODE}</Text>
//             <Text style={styles.rscol}> {data[0]?.AMOUNT}</Text>
//             <Text style={styles.col}>{data[0]?.INSTRUMENTNO}</Text>
//             <Text style={styles.col}>
//               {formatDate(data[0]?.INSTRUMENTDATE)}
//             </Text>

//             <Text style={styles.col}>{data[0]?.BANK_NAME}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}>Reference No/ संदर्भ क्रमांक</Text>
//             <Text style={styles.rscol}>Date / दिनांक</Text>
//             <Text style={styles.col}>Details / तपशिल</Text>
//             <Text style={styles.col}>Payable Amount / देय रक्कम</Text>
//             <Text style={styles.col}>Amt. Recd / मिळालेली रक्कम</Text>
//           </View>

//           {/* Row 1: First 3 items */}
//           <View style={styles.tableRow1}>
//             <Text style={styles.formno}>{data[0]?.RECPTNO}</Text>
//             <Text style={styles.Date}>{formatDate(data[0]?.RECPTDATE)}</Text>
//             <Text style={styles.Details}>{data[0]?.CHARGESNAME}</Text>
//             <Text style={styles.amount1}>{data[0]?.AMOUNT}</Text>
//             <Text style={styles.amount}>{data[0]?.AMOUNT}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.amtWords}>Amt In Words/ अक्षरी रुपये</Text>
//             <Text style={styles.amtWords1}>
//               {marathiNumberToWords(totalAmount)}
//             </Text>
//             <Text style={styles.col}>
//               Total Received Amt/ एकूण मिळालेली रक्कम
//             </Text>
//             <Text style={styles.col}>{data[0]?.AMOUNT}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.Remark}>Remark/शेरा :</Text>
//             <Text style={styles.Remark}>{data[0]?.REMARK}</Text>
//           </View>

//           <View style={styles.tableRow1}>
//             <Text style={styles.printBy}>Printed by : </Text>
//             <Text style={styles.printBy}>{data[0]?.USERNAME}</Text>
//             <Text style={styles.contact}>संपर्क :</Text>
//           </View>
//         </View>

//         <View style={styles.containerCustomer}>
//           <View style={styles.header}>
//             <Image src={logo} style={styles.logo} />
//             <View style={styles.titleBlock}>
//               <Text style={styles.title}>{companyName}</Text>
//               <Text style={styles.subTitle}>RECEIPT / पावती</Text>
//               <Text> सन {currentFinancialYear}</Text>
//             </View>
//             <View style={styles.receiptType}>
//               <Text>Customer Copy/ग्राहक प्रत</Text>
//             </View>
//           </View>
//           <Text style={styles.line}></Text>
//           <View style={styles.tableRow}>
//             <Text style={styles.col}>Receipt No. / पावती क्र.</Text>
//             <Text style={styles.col}>Date / दिनांक</Text>
//             <Text style={styles.col}>परवाना प्रकार</Text>
//             <Text style={styles.col}>परवाना क्र.</Text>
//             <Text style={styles.col}>प्रभाग समिती </Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}> {data[0]?.RECPTNO}</Text>
//             <Text style={styles.col}> {formatDate(data[0]?.RECPTDATE)}</Text>
//             <Text style={styles.col}>नवीन / नुतनीकरण </Text>
//             <Text style={styles.col}>{data[0]?.LICENSENO}</Text>
//             <Text style={styles.col}> {data[0]?.ZONENAME}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>अस्थापनेचे नाव/Shop name</Text>
//             <Text style={[styles.col, styles.second]}>
//               {" "}
//               {data[0]?.SHOPNAMEMAR} {data[0]?.SHOPNAME}
//             </Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>संचालकाचे नाव</Text>
//             <Text style={[styles.col, styles.second]}>
//               {data[0]?.DIRECTOR_NAME}
//             </Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>Narration / विवरण</Text>
//             <Text style={[styles.col, styles.second]}>परवाना प्रमाणपत्र</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.first}>Payment Mode / देयकाचा प्रकार</Text>
//             <Text style={[styles.col, styles.second]}> {data[0]?.PAYMODE}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}>Mode / प्रकार</Text>
//             <Text style={styles.rscol}>Rupees / रुपये</Text>
//             <Text style={styles.col}>Cheque No / धनादेश क्रमांक</Text>
//             <Text style={styles.col}>Cheque Date/धनादेश दिनांक</Text>
//             <Text style={styles.col}>Bank Name / बॅंकेचे नाव</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}> {data[0]?.PAYMODE}</Text>
//             <Text style={styles.rscol}> {data[0]?.AMOUNT}</Text>
//             <Text style={styles.col}>{data[0]?.INSTRUMENTNO}</Text>
//             <Text style={styles.col}>
//               {formatDate(data[0]?.INSTRUMENTDATE)}
//             </Text>

//             <Text style={styles.col}>{data[0]?.BANK_NAME}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.col}>Reference No/ संदर्भ क्रमांक</Text>
//             <Text style={styles.rscol}>Date / दिनांक</Text>
//             <Text style={styles.col}>Details / तपशिल</Text>
//             <Text style={styles.col}>Payable Amount / देय रक्कम</Text>
//             <Text style={styles.col}>Amt. Recd / मिळालेली रक्कम</Text>
//           </View>

//           {/* Row 1: First 3 items */}
//           <View style={styles.tableRow1}>
//             <Text style={styles.formno}>{data[0]?.RECPTNO}</Text>
//             <Text style={styles.Date}>{formatDate(data[0]?.RECPTDATE)}</Text>
//             <Text style={styles.Details}>{data[0]?.CHARGESNAME}</Text>
//             <Text style={styles.amount1}>{data[0]?.AMOUNT}</Text>
//             <Text style={styles.amount}>{data[0]?.AMOUNT}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.amtWords}>Amt In Words/ अक्षरी रुपये</Text>
//             <Text style={styles.amtWords1}>
//               {marathiNumberToWords(totalAmount)}
//             </Text>
//             <Text style={styles.col}>
//               Total Received Amt/ एकूण मिळालेली रक्कम
//             </Text>
//             <Text style={styles.col}>{data[0]?.AMOUNT}</Text>
//           </View>

//           <View style={styles.tableRow}>
//             <Text style={styles.Remark}>Remark/शेरा :</Text>
//             <Text style={styles.Remark}>{data[0]?.REMARK}</Text>
//           </View>

//           <View style={styles.tableRow1}>
//             <Text style={styles.printBy}>Printed by : </Text>
//             <Text style={styles.printBy}>{data[0]?.USERNAME}</Text>
//             <Text style={styles.contact}>संपर्क :</Text>
//           </View>
//         </View>
//       </Page>
//     </Document>
//   );
// };

// export default PrintCollectionReport;
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import moment from "moment";
import { marathiNumberToWords } from "../../utils/marathiNumberUtils"; // Ensure this path is correct

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "NotoSansDevanagari",
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
  containerCustomer: {
    border: "1 solid #000",
    fontSize: 9,
    paddingTop: 10,
    marginTop: 10,
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

  tableRow1: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    height: 25,
    padding: 4,
  },
  tablerow3: {
    flexDirection: "row",
    borderBottom: "1 solid #000",
    height: 40,
    padding: 4,
  },
  col: {
    flex: 1,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },

  bold: {
    fontWeight: "bold",
  },

  line: {
    border: "1 solid #000",
  },
  first: {
    width: 160,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "left",
  },
  second: {
    textAlign: "left",
  },
  rscol: {
    width: 70,
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "center",
  },
  amount: {
    width: 100,
    textAlign: "right",
    paddingRight: 4,
  },
  amount1: {
    width: 100,
    textAlign: "right",
    paddingRight: 40,
  },
  Details: {
    width: 250,
  },
  Date: {
    width: 110,
    textAlign: "center",
  },
  formno: {
    width: 150,
  },
  Remark: {
    textAlign: "left",
    height: 25,
    padding: 4,
  },
  printBy: {
    height: 30,
    padding: 4,
  },
  clerk: {
    textAlign: "left",
    paddingLeft: 130,
    marginTop: 10,
  },
  contact: {
    textAlign: "left",
    marginTop: 5,
    paddingLeft: 70,
  },
  receiptType: {
    fontSize: 12,
    marginTop: 30,
    textAlign: "right",
    paddingRight: 10,
  },
  amtWords: {
    width: 110,
    textAlign: "center",
    padding: 4,
    borderRight: "1 solid #000",
  },
  amtWords1: {
    width: 250,
    textAlign: "left",
    justifySelf: "center",
    padding: 6,
    borderRight: "1 solid #000",
  },
  spacer: {
    paddingHorizontal: 6, // Adjust this value to increase/decrease gap
  },
  shopNameContainer: {
    flexDirection: "row", // Important for Text elements to sit side-by-side
    alignItems: "center", // Vertically align the text parts
    flex: 1, // Allow it to take available space
    padding: 4,
    borderRight: "1 solid #000",
    textAlign: "left", // Keep text aligned left within its container
  },
  // Keep first and second styles if they are used elsewhere and important,
  // but shopNameContainer will likely replace the usage of second here.
});

const getFinancialYear = (date) => {
  const year = moment(date).year();
  const nextYear = (year + 1).toString().slice(-2);
  return `${year}-${nextYear}`;
};

const formatDate = (date) => {
  if (!date) return "";

  const localDate = new Date(date);

  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0"); // Month is 0-based
  const day = String(localDate.getDate()).padStart(2, "0");

  return `${day}/${month}/${year}`;
};

const PrintCollectionReport = ({ companyName, logo, data }) => {
  const currentFinancialYear = getFinancialYear(new Date());

  // Parse the amount from the first data item.
  // This is the single value that should be used everywhere.
  const displayAmount = parseFloat(data[0]?.AMOUNT) || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Office Copy */}
        <View style={styles.container}>
          <View style={styles.header}>
            <Image src={logo} style={styles.logo} />
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{companyName}</Text>
              <Text style={styles.subTitle}>RECEIPT / पावती</Text>
              <Text> सन {currentFinancialYear}</Text>
            </View>
            <View style={styles.receiptType}>
              <Text>Office Copy/कार्यालय प्रत</Text>
            </View>
          </View>
          <Text style={styles.line}></Text>
          <View style={styles.tableRow}>
            <Text style={styles.col}>Receipt No. / पावती क्र.</Text>
            <Text style={styles.col}>Date / दिनांक</Text>
            <Text style={styles.col}>परवाना प्रकार</Text>
            <Text style={styles.col}>परवाना क्र.</Text>
            <Text style={styles.col}>प्रभाग समिती </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}> {data[0]?.RECPTNO}</Text>
            <Text style={styles.col}> {formatDate(data[0]?.RECPTDATE)}</Text>
            <Text style={styles.col}>नवीन / नुतनीकरण </Text>
            <Text style={styles.col}>{data[0]?.LICENSENO}</Text>
            <Text style={styles.col}> {data[0]?.ZONENAME}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.first}>अस्थापनेचे नाव/Shop name</Text>
            <View style={styles.shopNameContainer}>
              {" "}
              {/* Use a View to contain the multiple Text elements */}
              <Text>{data[0]?.SHOPNAMEMAR}</Text>
              {data[0]?.SHOPNAMEMAR &&
                data[0]?.SHOPNAME && ( // Only show '/' and spacer if both parts exist
                  <>
                    <Text style={styles.spacer}>/</Text>{" "}
                    {/* Spacer for the gap */}
                    <Text></Text>{" "}
                    {/* An additional empty Text to push the next text */}
                  </>
                )}
              <Text>{data[0]?.SHOPNAME}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.first}>संचालकाचे नाव</Text>
            <Text style={[styles.col, styles.second]}>
              {data[0]?.DIRECTOR_NAME}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.first}>Narration / विवरण</Text>
            <Text style={[styles.col, styles.second]}>परवाना प्रमाणपत्र</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.first}>Payment Mode / देयकाचा प्रकार</Text>
            <Text style={[styles.col, styles.second]}> {data[0]?.PAYMODE}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}>Mode / प्रकार</Text>
            <Text style={styles.rscol}>Rupees / रुपये</Text>
            <Text style={styles.col}>Cheque No / धनादेश क्रमांक</Text>
            <Text style={styles.col}>Cheque Date/धनादेश दिनांक</Text>
            <Text style={styles.col}>Bank Name / बॅंकेचे नाव</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}> {data[0]?.PAYMODE}</Text>
            {/* Displaying the parsed displayAmount */}
            <Text style={styles.rscol}> {displayAmount}</Text>
            <Text style={styles.col}>{data[0]?.INSTRUMENTNO}</Text>
            <Text style={styles.col}>
              {formatDate(data[0]?.INSTRUMENTDATE)}
            </Text>
            <Text style={styles.col}>{data[0]?.BANK_NAME}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}>Reference No/ संदर्भ क्रमांक</Text>
            <Text style={styles.rscol}>Date / दिनांक</Text>
            <Text style={styles.col}>Details / तपशिल</Text>
            <Text style={styles.col}>Payable Amount / देय रक्कम</Text>
            <Text style={styles.col}>Amt. Recd / मिळालेली रक्कम</Text>
          </View>

          <View style={styles.tableRow1}>
            <Text style={styles.formno}>{data[0]?.RECPTNO}</Text>
            <Text style={styles.Date}>{formatDate(data[0]?.RECPTDATE)}</Text>
            <Text style={styles.Details}>{data[0]?.CHARGESNAME}</Text>
            {/* Displaying the parsed displayAmount */}
            <Text style={styles.amount1}>{displayAmount}</Text>
            <Text style={styles.amount}>{displayAmount}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.amtWords}>Amt In Words/ अक्षरी रुपये</Text>
            {/* Using displayAmount for conversion to words */}
            <Text style={styles.amtWords1}>
              {marathiNumberToWords(displayAmount)}
            </Text>
            <Text style={styles.col}>
              Total Received Amt/ एकूण मिळालेली रक्कम
            </Text>
            {/* Displaying the parsed displayAmount */}
            <Text style={styles.col}>{displayAmount}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.Remark}>Remark/शेरा :</Text>
            <Text style={styles.Remark}>{data[0]?.REMARK}</Text>
          </View>

          <View style={styles.tablerow3}>
            <Text style={styles.printBy}>Printed by : </Text>
            <Text style={styles.printBy}>{data[0]?.USERNAME}</Text>
            <Text style={styles.contact}>संपर्क :</Text>
            <Text
              style={{ textAlign: "right", marginTop: "18", marginLeft: "130" }}
            >
              Receiver's Signature / स्वीकारणाऱ्याची स्वाक्षरी
            </Text>
          </View>
        </View>

        {/* Header - Customer Copy */}
        <View style={styles.containerCustomer}>
          <View style={styles.header}>
            <Image src={logo} style={styles.logo} />
            <View style={styles.titleBlock}>
              <Text style={styles.title}>{companyName}</Text>
              <Text style={styles.subTitle}>RECEIPT / पावती</Text>
              <Text> सन {currentFinancialYear}</Text>
            </View>
            <View style={styles.receiptType}>
              <Text>Customer Copy/ग्राहक प्रत</Text>
            </View>
          </View>
          <Text style={styles.line}></Text>
          <View style={styles.tableRow}>
            <Text style={styles.col}>Receipt No. / पावती क्र.</Text>
            <Text style={styles.col}>Date / दिनांक</Text>
            <Text style={styles.col}>परवाना प्रकार</Text>
            <Text style={styles.col}>परवाना क्र.</Text>
            <Text style={styles.col}>प्रभाग समिती </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}> {data[0]?.RECPTNO}</Text>
            <Text style={styles.col}> {formatDate(data[0]?.RECPTDATE)}</Text>
            <Text style={styles.col}>नवीन / नुतनीकरण </Text>
            <Text style={styles.col}>{data[0]?.LICENSENO}</Text>
            <Text style={styles.col}> {data[0]?.ZONENAME}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.first}>अस्थापनेचे नाव/Shop name</Text>
            <View style={styles.shopNameContainer}>
              {" "}
              {/* Use a View to contain the multiple Text elements */}
              <Text>{data[0]?.SHOPNAMEMAR}</Text>
              {data[0]?.SHOPNAMEMAR &&
                data[0]?.SHOPNAME && ( // Only show '/' and spacer if both parts exist
                  <>
                    <Text style={styles.spacer}>/</Text>{" "}
                    {/* Spacer for the gap */}
                    <Text></Text>{" "}
                    {/* An additional empty Text to push the next text */}
                  </>
                )}
              <Text>{data[0]?.SHOPNAME}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.first}>संचालकाचे नाव</Text>
            <Text style={[styles.col, styles.second]}>
              {data[0]?.DIRECTOR_NAME}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.first}>Narration / विवरण</Text>
            <Text style={[styles.col, styles.second]}>परवाना प्रमाणपत्र</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.first}>Payment Mode / देयकाचा प्रकार</Text>
            <Text style={[styles.col, styles.second]}> {data[0]?.PAYMODE}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}>Mode / प्रकार</Text>
            <Text style={styles.rscol}>Rupees / रुपये</Text>
            <Text style={styles.col}>Cheque No / धनादेश क्रमांक</Text>
            <Text style={styles.col}>Cheque Date/धनादेश दिनांक</Text>
            <Text style={styles.col}>Bank Name / बॅंकेचे नाव</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}> {data[0]?.PAYMODE}</Text>
            {/* Displaying the parsed displayAmount */}
            <Text style={styles.rscol}> {displayAmount}</Text>
            <Text style={styles.col}>{data[0]?.INSTRUMENTNO}</Text>
            <Text style={styles.col}>
              {formatDate(data[0]?.INSTRUMENTDATE)}
            </Text>
            <Text style={styles.col}>{data[0]?.BANK_NAME}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.col}>Reference No/ संदर्भ क्रमांक</Text>
            <Text style={styles.rscol}>Date / दिनांक</Text>
            <Text style={styles.col}>Details / तपशिल</Text>
            <Text style={styles.col}>Payable Amount / देय रक्कम</Text>
            <Text style={styles.col}>Amt. Recd / मिळालेली रक्कम</Text>
          </View>

          <View style={styles.tableRow1}>
            <Text style={styles.formno}>{data[0]?.RECPTNO}</Text>
            <Text style={styles.Date}>{formatDate(data[0]?.RECPTDATE)}</Text>
            <Text style={styles.Details}>{data[0]?.CHARGESNAME}</Text>
            {/* Displaying the parsed displayAmount */}
            <Text style={styles.amount1}>{displayAmount}</Text>
            <Text style={styles.amount}>{displayAmount}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.amtWords}>Amt In Words/ अक्षरी रुपये</Text>
            {/* Using displayAmount for conversion to words */}
            <Text style={styles.amtWords1}>
              {marathiNumberToWords(displayAmount)}
            </Text>
            <Text style={styles.col}>
              Total Received Amt/ एकूण मिळालेली रक्कम
            </Text>
            {/* Displaying the parsed displayAmount */}
            <Text style={styles.col}>{displayAmount}</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.Remark}>Remark/शेरा :</Text>
            <Text style={styles.Remark}>{data[0]?.REMARK}</Text>
          </View>

          <View style={styles.tablerow3}>
            <Text style={styles.printBy}>Printed by : </Text>
            <Text style={styles.printBy}>{data[0]?.USERNAME}</Text>
            <Text style={styles.contact}>संपर्क :</Text>
            <Text
              style={{ textAlign: "right", marginTop: "18", marginLeft: "130" }}
            >
              Receiver's Signature / स्वीकारणाऱ्याची स्वाक्षरी
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PrintCollectionReport;
