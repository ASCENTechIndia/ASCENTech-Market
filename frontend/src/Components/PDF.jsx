import React, { useState, useEffect } from "react";

import jsPDF from "jspdf";
import "jspdf-autotable";
import SaveBtn from "./Buttons/Save-Button";

const PDFGenerator = ({ apiData, logo, fields, tableData, marathiFont }) => {
  const [logoBase64, setLogoBase64] = useState("");

  // Convert Logo to Base64
  useEffect(() => {
    if (logo) {
      const convertToBase64 = async () => {
        try {
          const response = await fetch(logo);
          const blob = await response.blob();
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => setLogoBase64(reader.result);
        } catch (error) {
          console.error("Error loading logo:", error);
        }
      };
      convertToBase64();
    }
  }, [logo]);

  const generatePDF = (action) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ✅ Add Marathi Font (if applicable)
    if (marathiFont) {
      doc.addFileToVFS("NotoSansDevanagari-Regular.ttf", marathiFont);
      doc.addFont(
        "NotoSansDevanagari-Regular.ttf",
        "NotoSansDevanagari",
        "normal"
      );
      doc.setFont("NotoSansDevanagari");
    }

    // ✅ Municipal Name & Department
    const municipalName = apiData?.municipalName || "ABC Municipal Council";
    const department =
      apiData?.department || "Marriage Registration Department";
    const pageTitle = apiData?.pageTitle || "Common Receipt";

    // ✅ Draw External Border
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 270);

    // ✅ Add Logo
    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", 15, 15, 30, 30);
    }

    // ✅ Municipal Name
    doc.setFontSize(22);
    doc.setTextColor(201, 38, 38);
    doc.text(
      municipalName,
      (pageWidth - doc.getTextWidth(municipalName)) / 2,
      30
    );

    // ✅ Department Name
    doc.setFontSize(14);
    doc.setTextColor(150, 50, 50);
    doc.text(department, (pageWidth - doc.getTextWidth(department)) / 2, 40);

    // ✅ Separator Line
    doc.setLineWidth(0.5);
    doc.line(20, 50, pageWidth - 20, 50);

    // ✅ Page Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255);
    doc.setFont(undefined, "italic");
    doc.text(pageTitle, (pageWidth - doc.getTextWidth(pageTitle)) / 2, 65);

    // ✅ Table Data
    doc.autoTable({
      head: [fields],
      body: tableData,
      startY: 80,
      theme: "grid",
      styles: { fontSize: 12, cellPadding: 3 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });

    if (action === "preview") {
      // ✅ Open PDF in a new tab (but NOT download)
      doc.output("dataurlnewwindow");
    } else if (action === "download") {
      // ✅ Save PDF only when user clicks "Download PDF"
      doc.save("CommonReceipt.pdf");
    }
  };

  return (
    <div>
      <SaveBtn onClick={() => generatePDF("preview")} text="Download PDF" />
    </div>
  );
};

export default PDFGenerator;