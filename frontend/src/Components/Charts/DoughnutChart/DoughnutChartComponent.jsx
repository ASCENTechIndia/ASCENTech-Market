import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import themeColors from "../../../colour/colour"; // Import theme colors
import './DoughnutChart.css'; // Import the CSS file for custom styles


Chart.register(ArcElement, Tooltip, Legend);

const DoughnutChart = () => {
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
                data: values,
                backgroundColor: [...themeColors.backgroundColor], // Apply colors
                borderColor: [...themeColors.borderColor], // Apply border colors
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
    responsive: true,      // Ensure it resizes correctly
    maintainAspectRatio: false,  // Allow manual control of width/height
    plugins: {
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="doughnut-chart-container">
      <h2>Doughnut Chart</h2>
      {chartData ? <Doughnut data={chartData} options={chartOptions} /> : <p>Loading Chart...</p>}
    </div>
  );
};

export default DoughnutChart;
