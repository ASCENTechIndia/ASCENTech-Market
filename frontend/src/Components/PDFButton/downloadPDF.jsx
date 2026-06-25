import { pdf, Font } from "@react-pdf/renderer";
import { Buffer } from "buffer"; // Import Buffer polyfill for the browser
import { saveAs } from "file-saver";

Font.register({
  family: "NotoSansDevanagari",
  src: "/fonts/NotoSansDevanagari-Regular.ttf",
});

const PDFGenerate = async ({ PDFComponent, data, fileName }) => {
  try {
    const blob = await pdf(<PDFComponent data={data} />).toBlob();
    saveAs(blob, fileName);
  } catch (error) {
    console.error("PDF generation error:", error);
  }
};

export default PDFGenerate;
