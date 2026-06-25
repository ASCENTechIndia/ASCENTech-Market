// chart.js

import { Chart as ChartJS, CategoryScale, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Registering all necessary components globally
ChartJS.register(
  CategoryScale, // Category-based scale for bar charts
  ArcElement,    // For pie and doughnut charts
  Title,         // For chart title
  Tooltip,       // For tooltips
  Legend         // For legend display
);

export default ChartJS;
