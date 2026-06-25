import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarController, BarElement, Tooltip, Legend } from "chart.js";
import themeColors from "../../../colour/colour"; // Import theme colors
import './BarChart.css'; // Import the CSS file for custom styles

Chart.register(CategoryScale, LinearScale, BarController, BarElement, Tooltip, Legend);

const BarChart = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("/db.json")
      .then((response) => response.json())
      .then((data) => {
        if (data.chartData && Array.isArray(data.chartData)) {
          const labels = data.chartData.map((item) => item.label);
          const values = data.chartData.map((item) => item.data);

          setChartData({
            labels: labels,
            datasets: [
              {
                label: 'Data',
                data: values,
                backgroundColor: themeColors.backgroundColor || '#2F6EFF', // Default color if not found
                borderColor: themeColors.borderColor || '#BFBFBF', // Default color if not found
                borderWidth: 2,
              },
            ],
          });
        } else {
          console.error("Invalid API response format:", data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const chartOptions = {
    responsive: true,       // Ensure it resizes correctly based on the container
    maintainAspectRatio: false,  // Allow custom width/height (we control it via CSS)
    scales: {
      x: {
        type: 'category',
      },
      y: {
        type: 'linear',
        beginAtZero: true,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="bar-chart-container">
      <h2>Bar Chart</h2>
      {chartData ? <Bar data={chartData} options={chartOptions} /> : <p>Loading Chart...</p>}
    </div>
  );
};

export default BarChart;
