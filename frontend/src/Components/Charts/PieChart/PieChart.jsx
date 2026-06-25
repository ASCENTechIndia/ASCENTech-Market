import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useRef } from "react";

// Register Chart.js components and the datalabels plugin
Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// Define themeColors here, as it's directly used by the chart for colors
const themeColors = {
  lightGray: "#ced4da",
  offWhite: "#f8f9fa",
  gray: "#6c757d",
  blue: "#007bff",
  additionalColors: [
    "#28a745",
    "#ffc107",
    "#dc3545",
    "#17a2b8",
    "#fd7e14",
    "#6f42c1",
    "#e83e8c",
    "#20c997",
    "#fd7e14",
    "#6610f2",
    "#fd7e14",
    "#a0522d",
    "#8a2be2",
    "#d2691e",
    "#ff7f50",
    "#6495ed",
    "#dc143c",
    "#00ffff",
    "#00008b",
    "#008b8b",
    "#b8860b",
    "#a9a9a9",
    "#006400",
    "#bdb76b",
    "#8b008b",
    "#556b2f",
    "#ff8c00",
    "#9932cc",
    "#e9967a",
    "#8fbc8f",
    "#483d8b",
    "#2f4f4f",
    "#cc0000",
    "#00cc00",
    "#0000cc",
    "#cccc00",
    "#cc00cc",
    "#00cccc",
    "#999999",
  ],
};

// This component now receives the necessary data and handlers as props
const PieChart = ({
  data,
  chartMode,
  currentChartYear,
  currentChartMonthName,
  onSliceClick,
  onBack,
}) => {
  const chartRef = useRef(null);

  // Dynamic Chart Title and Breadcrumbs
  const getChartTitle = () => {
    return (
      <>
        {/* Breadcrumb Navigation - Always aligned left within its container */}
        <div className="text-start mb-2" style={{ minHeight: "24px" }}>
          {" "}
          {/* Add minHeight to prevent jump */}
          {chartMode === "monthly" && (
            <>
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => onBack("yearly")} // Go back to years
              >
                Years
              </span>{" "}
              / {currentChartYear}
            </>
          )}
          {chartMode === "daily" && (
            <>
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => onBack("monthly")} // Go back to yearly view
              >
                Month
              </span>{" "}
              /{" "}
              <span
                className="text-primary"
                style={{ cursor: "pointer" }}
                onClick={() => onBack("monthly")} // Go back to selected year's monthly view
              >
                {currentChartMonthName}
              </span>
            </>
          )}
        </div>

        {/* Main Heading and Call to Action - Always centered */}
        <div className="text-center">
          {chartMode === "yearly" && (
            <>
              <h5>Years</h5>
              <h6>Click on a slice to see monthly data for that year.</h6>
            </>
          )}
          {chartMode === "monthly" && (
            <>
              <h5>Months</h5>{" "}
              {/* Changed from Month to Months for consistency */}
              <h6>Click on a slice to see daily data for that month.</h6>
            </>
          )}
          {chartMode === "daily" && <h5>Days</h5>}
        </div>
      </>
    );
  };

  // Pie Chart Options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: onSliceClick, // Use the passed-in click handler
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            let label = context.label;
            if (label) label += ": ";
            if (context.parsed !== null)
              label += context.parsed.toLocaleString();
            return label;
          },
        },
      },
      datalabels: {
        formatter: (value, ctx) => `${ctx.chart.data.labels[ctx.dataIndex]}`,
        color: "#fff",
        backgroundColor: (context) => context.dataset.backgroundColor,
        borderColor: "white",
        borderWidth: 2,
        borderRadius: 4,
        padding: 6,
        anchor: "end",
        align: "end",
        offset: 20,
        font: {
          weight: "bold",
        },
      },
    },
    layout: {
      padding: { top: 50, bottom: 50, left: 50, right: 50 },
    },
  };

  // The 'data' prop already contains the formatted data for Chart.js
  const chartDataToRender = data;

  // For Download chart in dashboard
  const getImageWithWhiteBg = (chart, type = "image/png") => {
  const canvas = chart.canvas;
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = canvas.width;
  tmpCanvas.height = canvas.height;
  const ctx = tmpCanvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

  ctx.drawImage(canvas, 0, 0);

  return tmpCanvas.toDataURL(type);
};

const handleDownloadImage = (type = "png") => {
  const chart = chartRef.current;
  if (!chart) return;

  const image = getImageWithWhiteBg(chart, `image/${type}`);
  const link = document.createElement("a");
  link.href = image;
  link.download = `chart.${type}`;
  link.click();
};

  const handlePrint = () => {
  const chart = chartRef.current;
  if (!chart) return;

  const imgData = chart.toBase64Image();

  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Chart</title>
        <style>
          body { margin: 0; padding: 0; text-align: center; }
          img { max-width: 100%; height: auto; margin: 60px auto; }
        </style>
      </head>
      <body>
        <img src="${imgData}" onload="window.print(); window.close();" />
      </body>
    </html>
  `);
  printWindow.document.close();
};


  const handleDownloadCSV = () => {
    if (!data?.labels || !data?.datasets) return;

    let csvContent = "Label,Value\n";
    data.labels.forEach((label, idx) => {
      const value = data.datasets[0].data[idx];
      csvContent += `${label},${value}\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "chart_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadXLS = () => {
    if (!data?.labels || !data?.datasets) return;
    let html = `<table><tr><th>Label</th><th>Value</th></tr>`;
    data.labels.forEach((label, idx) => {
      const value = data.datasets[0].data[idx];
      html += `<tr><td>${label}</td><td>${value}</td></tr>`;
    });
    html += `</table>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "chart_data.xls";
    link.click();
  };

  const handleDownloadPDF = () => {
    import("jspdf").then((jsPDF) => {
      const chart = chartRef.current;
      if (!chart) return;
      const imgData = chart.toBase64Image();

      const pdf = new jsPDF.default();
      pdf.addImage(imgData, "PNG", 15, 40, 180, 100);
      pdf.save("chart.pdf");
    });
  };

  return (
    <div
      className="card-body d-flex flex-column"
      style={{ height: "550px" }} // Keep the existing styling
    >
      {getChartTitle()} {/* Render the dynamic title */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {chartDataToRender ? (
          <Pie
            ref={chartRef}
            data={chartDataToRender}
            options={pieChartOptions}
          />
        ) : (
          <p>Loading Chart...</p>
        )}
      </div>
      {/* Dropdown menu for chart actions (moved here as it's part of chart UI) */}
      <div className="position-absolute top-0 end-0 p-2">
        <div className="dropdown">
          <button
            className="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
          >
            <i className="bi bi-list"></i>{" "}
          </button>
          <ul className="dropdown-menu dropdown-menu-end">
            <li>
              <button className="dropdown-item" onClick={handlePrint}>
                Print chart
              </button>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleDownloadImage("png")}
              >
                Download PNG image
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleDownloadImage("jpeg")}
              >
                Download JPEG image
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleDownloadPDF}>
                Download PDF document
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => handleDownloadImage("svg")}
              >
                Download SVG vector image
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleDownloadCSV}>
                Download CSV
              </button>
            </li>
            <li>
              <button className="dropdown-item" onClick={handleDownloadXLS}>
                Download XLS
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={() => alert("Data table view not implemented yet")}
              >
                View data table
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PieChart;
