import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import colors from "../../../colour/colour"; // Import theme colors
import "./LineGraph.css"; // Import CSS for styling



// Register Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const LineGraph = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch("/db.json") // Ensure `db.json` is inside `public/`
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Data:", data); // Debugging

        if (data.chartData && Array.isArray(data.chartData)) {
          const labels = data.chartData.map((item) => item.label);
          const values = data.chartData.map((item) => item.data);

          setChartData({
            labels: labels,
            datasets: [
              {
                label: "Monthly Data",
                data: values,
                borderColor: colors.blue,
                backgroundColor: colors.lightGray,
                pointBackgroundColor: colors.blue,
                pointBorderColor: colors.offWhite,
                borderWidth: 2,
                tension: 0.4, // Smooth curve
              },
            ],
          });
        } else {
          console.error("Invalid API response format:", data);
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="line-chart-container">
      <h2>Line Graph</h2>
      {chartData ? <Line data={chartData} /> : <p>Loading Chart...</p>}
    </div>
  );
};

export default LineGraph;
