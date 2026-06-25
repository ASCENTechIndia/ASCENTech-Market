import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./FunnelChart.css"; // Import the CSS file
import colors from "../../../colour/colour" // Import colors dynamically from color.js



// Register required chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const FunnelChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Fetch data from db.json (placed in the public/ folder)
    fetch("/db.json")
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Data:", data);

        // Extract funnel data
        const funnelData = data.funnelData;

        // Color configuration from the imported color.js
        const config = {
          backgroundColor: [
            colors.blue,   // Dynamic color from color.js
            colors.green,
            colors.orange,
            colors.red,
            colors.purple,
          ],
          borderColor: [
            colors.blueBorder,  // Dynamic border color from color.js
            colors.greenBorder,
            colors.orangeBorder,
            colors.redBorder,
            colors.purpleBorder,
          ],
        };

        // Prepare chart data
        const chartData = {
          labels: funnelData.map((stage) => stage.label),
          datasets: [
            {
              label: "Conversion Rate",
              data: funnelData.map((stage) => stage.conversionRate),
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              borderWidth: 1,
            },
          ],
        };

        // Set the chart data in state
        setChartData(chartData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // Empty dependency array ensures this runs once on component mount

  return (
    <div className="funnel-chart-container">
      <h2>Funnel Chart</h2>
      {chartData ? <Bar data={chartData} options={chartOptions} /> : <p>Loading Chart...</p>}
    </div>
  );
};

// Customize chart options to simulate funnel-like appearance
const chartOptions = {
  indexAxis: 'y', // This ensures the chart is horizontal
  scales: {
    x: {
      beginAtZero: true,
      max: 100, // We are using percentage for the funnel chart
    },
    y: {
      beginAtZero: true,
      ticks: {
        padding: 20,
      },
    },
  },
  plugins: {
    title: {
      display: true,
      text: "Funnel Chart - Conversion Rates",
      font: {
        size: 18,
      },
    },
    tooltip: {
      enabled: true,
    },
  },
};

export default FunnelChart;
