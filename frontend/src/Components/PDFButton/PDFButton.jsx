import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import GeneratePDF from "./GeneratePDF";
import { useLanguage } from "../../Context/LanguageProvider";

const PDFButton = ({
  title,
  headers,
  data,
  fileName,
  companyName,
  receiptName,
  logo,
  disabled,
}) => {
  const { translate } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);
  Font.register({
    family: "NotoSansDevanagari",
    src: "/fonts/NotoSansDevanagari-Regular.ttf",
  });
  //const logoSrc = logo || process.env.REACT_APP_LOGO_URL || "https://via.placeholder.com/100"; // Ensure logo is always defined

  return (
    <>
      {/* Preview & Download Button */}
      <Button
        variant="primary"
        onClick={() => setShowPreview(true)}
        disabled={disabled}
      >
        {translate("Preview & Download")}
      </Button>

      {/* PDF Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{translate("PDF Preview")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* ✅ Use PDFViewer instead of directly rendering GeneratePDF */}
          <PDFViewer width="100%" height={500}>
            <GeneratePDF
              title={title}
              headers={headers}
              data={data}
              companyName={companyName}
              logo={logo}
              receiptName={receiptName} // ✅ Add your custom receipt name here
            />
          </PDFViewer>
        </Modal.Body>
        <Modal.Footer>
          {/* PDF Download Button */}
          <PDFDownloadLink
            document={
              <GeneratePDF
                title={title}
                headers={headers}
                data={data}
                companyName={companyName}
                logo={logoSrc}
              />
            }
            fileName={fileName || "document.pdf"}
          >
            {({ loading }) => (
              <Button variant="success" disabled={loading}>
                {loading
                  ? translate("Generating PDF...")
                  : translate("Download")}
              </Button>
            )}
          </PDFDownloadLink>

          {/* Close Button */}
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            {translate("Close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PDFButton;
