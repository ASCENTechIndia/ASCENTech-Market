// import React from "react";
// import { Doughnut } from "react-chartjs-2";
// import "chart.js/auto";
// import { useLanguage } from "../../../../Context/LanguageProvider";


// const ChartComponent = () => {
//       const { translate } = useLanguage();
//   const suspensionData = [
//     { label: translate("Aging < 3 Days"), count: 3, color: "#b71c1c" },
//     { label: translate("Aging 4-10 Days"), count: 7, color: "#1976d2" },
//     { label: translate("Aging 11-30 Days"), count: 35, color: "#fbc02d" },
//     { label: translate("Aging > 30 Days"), count: 65, color: "#6a1b9a" },
//   ];

//   const chartData = {
//     labels: suspensionData.map((d) => d.label),
//     datasets: [
//       {
//         data: suspensionData.map((d) => d.count),
//         backgroundColor: suspensionData.map((d) => d.color),
//         hoverOffset: 4,
//       },
//     ],
//   };

//   // Hide Chart Labels Inside the Doughnut
//   const chartOptions = {
//     plugins: {
//       legend: {
//         display: false, // Hides labels inside the chart
//       },
//     },
//   };

//   return (
//     <div className="chart-container">
//       <Doughnut data={chartData} options={chartOptions} />
//       <div className="chart-legend">
//         {suspensionData.map((d, index) => (
//           <div key={index} className="legend-item">
//             <span
//               className="legend-color"
//               style={{ backgroundColor: d.color }}
//             ></span>
//             {d.label}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ChartComponent;




import React from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";
import { useLanguage } from "../../Context/LanguageProvider";

const ChartComponent = ({ data = [], loading }) => {
  const { translate } = useLanguage();

  if (loading) return <p>{translate("Loading chart...")}</p>;

  // Assign colors (can extend)
  const colors = ["#b71c1c", "#1976d2", "#fbc02d", "#6a1b9a", "#388e3c"];
  const chartData = {
    labels: data.map((d) => translate(d.dueIn)),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: colors.slice(0, data.length),
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="chart-container">
      <Doughnut data={chartData} options={chartOptions} />
      <div className="chart-legend">
        {data.map((d, index) => (
          <div key={index} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: colors[index % colors.length] }}
            ></span>
            {translate(d.dueIn)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartComponent;
