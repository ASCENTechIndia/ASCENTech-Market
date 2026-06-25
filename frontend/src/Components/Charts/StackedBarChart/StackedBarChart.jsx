import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend } from "chart.js";
import themeColors from "../../../colour/colour"; // Import theme colors
import './StackedBarChart.css'; // Import the CSS file for custom styles

// Register the required chart.js components
Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const StackedBarChart = () => {
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
                label: "Dataset 1",
                data: values.map((value) => value[0]),
                backgroundColor: themeColors.backgroundColor[0],
                stack: "stack1",
              },
              {
                label: "Dataset 2",
                data: values.map((value) => value[1]),
                backgroundColor: themeColors.backgroundColor[1],
                stack: "stack1",
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
    responsive: true,
    maintainAspectRatio: false, // Allow manual control of width/height
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        stacked: true,  // Enable stacking on X-axis
      },
      y: {
        stacked: true,  // Enable stacking on Y-axis
      },
    },
  };

  return (
    <div className="stacked-bar-chart-container">
      <h2>Stacked Bar Chart</h2>
      {chartData ? <Bar data={chartData} options={chartOptions} /> : <p>Loading Chart...</p>}
    </div>
  );
};

export default StackedBarChart;
