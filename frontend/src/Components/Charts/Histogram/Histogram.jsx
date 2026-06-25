import React, { useEffect, useState } from "react";
import { Histogram } from "react-chartjs-2"; // Import Histogram (Bar Chart)
import colors from "../../../colour/colour"; // Import theme colors
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import "./Histogram.css"; // Import the CSS file
// Register required chart components

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Histogram = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    console.log("Theme Colors:", colors); // Debugging to check color values

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
                label: "Data Distribution",
                data: values,
                backgroundColor: colors.blue, // Histogram color from theme
                borderColor: colors.offWhite, // Border color
                borderWidth: 1,
                barThickness: 20, // Adjust bar thickness
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
    <div className="histogram-container">
      <h2>Histogram</h2>
      {chartData ? <Histogram data={chartData} /> : <p>Loading Chart...</p>}
    </div>
  );
};

export default Histogram;
