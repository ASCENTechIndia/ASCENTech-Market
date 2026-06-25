// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import { Doughnut, Line } from "react-chartjs-2";
// import ChartDataLabels from "chartjs-plugin-datalabels";
// import Header from "../../HOC/Header/Header";
// import Navbar from "../../HOC/Navbar/Navbar";
// import apiService from "../../../apiService"; // Assuming this is your axios wrapper
// import { useAuth } from "../../Context/AuthContext";

// // Register Chart.js components and plugins
// ChartJS.register(
//   ArcElement,
//   LineElement,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Title,
//   Tooltip,
//   Legend,
//   ChartDataLabels
// );

// const Dashboard = () => {
//   const { user } = useAuth(); // Assuming useAuth provides user object
//   const userId = user?.userId;
//   const ulbId = user?.ulbId;
//   const [counts, setCounts] = useState({
//     APPLINO: 0,
//     APPROVE: 0,
//     PENDING: 0,
//     REJECT: 0,
//     PAYMENT_PENDING: 0,
//     PAYMENT_DONE: 0,
//     DELIVERED: 0,
//   });

//   const [agingReport, setAgingReport] = useState([]);
//   const [collectionData, setCollectionData] = useState({
//     labels: [],
//     datasets: [
//       {
//         label: "Total Collection (Yearly)",
//         data: [],
//         fill: true,
//         backgroundColor: "rgba(54, 162, 235, 0.2)",
//         borderColor: "rgba(54, 162, 235, 1)",
//         tension: 0.4,
//       },
//     ],
//   });

//   const [statusWiseData, setStatusWiseData] = useState({
//     labels: ["Approved", "Rejected", "Pending"],
//     datasets: [
//       {
//         data: [0, 0, 0],
//         backgroundColor: ["#20c997", "#ff6384", "#ffa726"],
//         borderWidth: 2,
//       },
//     ],
//   });

//   // State for Trade Wise Applications data (Corrected to display Statuses)
//   const [tradeWiseData, setTradeWiseData] = useState({
//     labels: [], // Will be populated with status names (Approved, Pending, etc.)
//     datasets: [
//       {
//         data: [],
//         backgroundColor: [
//           "#36A2EB",
//           "#FFCE56",
//           "#FF6384",
//           "#4BC0C0",
//           "#9966FF",
//           "#FF9F40",
//           "#C9CB30",
//         ],
//         borderWidth: 2,
//       },
//     ],
//   });

//   const [rejectedTrendData, setRejectedTrendData] = useState({
//     labels: [],
//     datasets: [
//       {
//         label: "Rejected Applications (Monthly)",
//         data: [],
//         fill: false,
//         borderColor: "#ff6384",
//         backgroundColor: "#ff6384",
//         tension: 0.4,
//         pointRadius: 5,
//         pointBackgroundColor: "#ff6384",
//       },
//     ],
//   });

//   const [loading, setLoading] = useState(true);

//   // --- API Fetch Functions ---

//   // Fetch Dashboard Counts
//   const fetchDashboardCounts = async () => {
//     try {
//       setLoading(true);
//       const response = await apiService.post("GetDashboardCount", { ulbId });
//       if (response?.data?.success && response.data.data?.length > 0) {
//         const data = response.data.data;
//         // Sum up the counts across all objects in the array
//         const totals = data.reduce(
//           (acc, curr) => ({
//             APPLINO: acc.APPLINO + (curr.APPLINO || 0),
//             APPROVE: acc.APPROVE + (curr.APPROVE || 0),
//             PENDING: acc.PENDING + (curr.PENDING || 0),
//             REJECT: acc.REJECT + (curr.REJECT || 0),
//             PAYMENT_PENDING: acc.PAYMENT_PENDING + (curr.PAYMENT_PENDING || 0),
//             PAYMENT_DONE: acc.PAYMENT_DONE + (curr.PAYMENT_DONE || 0),
//             DELIVERED: acc.DELIVERED + (curr.DELIVERED || 0),
//           }),
//           counts // Start with the initial state values
//         );
//         setCounts(totals);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching dashboard counts:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch Aging Report
//   const fetchAgingReport = async () => {
//     try {
//       const response = await apiService.post("GetAgeingReport", { ulbId });
//       if (response?.data?.success && response.data.data?.length > 0) {
//         setAgingReport(response.data.data);
//       }
//     } catch (err) {
//       console.error("❌ Error fetching Aging Report:", err);
//     }
//   };

//   // Fetch Collection Data
//   const fetchCollectionData = async () => {
//     try {
//       const response = await apiService.post("GetMonthWise", { ulbId });
//       if (response?.data?.success && response.data.data?.length > 0) {
//         const data = response.data.data;

//         const collectionByYear = data.reduce((acc, curr) => {
//           // Assuming APPLIDT contains the year or can be parsed to a year
//           const year = curr.APPLIDT;
//           acc[year] = (acc[year] || 0) + (curr.TOT_COLL || 0);
//           return acc;
//         }, {});

//         setCollectionData({
//           labels: Object.keys(collectionByYear),
//           datasets: [
//             {
//               label: "Total Collection (Yearly)",
//               data: Object.values(collectionByYear),
//               fill: true,
//               backgroundColor: "rgba(54, 162, 235, 0.2)",
//               borderColor: "rgba(54, 162, 235, 1)",
//               tension: 0.4,
//             },
//           ],
//         });
//       }
//     } catch (err) {
//       console.error("❌ Error fetching Collection data:", err);
//     }
//   };

//   // Fetch Status Wise Data
//   const fetchStatusWiseData = async () => {
//     try {
//       const response = await apiService.post("GetApplicationStatus", {
//         ulbId,
//       });

//       if (response?.data?.success && response.data.data?.length > 0) {
//         const allData = response.data.data;
//         // Find the specific ULB data (ulbId: 5)
//         const ulb5Data = allData.find((item) => item.ULBID === ulbId);

//         let approved = 0;
//         let rejected = 0;
//         let pending = 0;

//         if (ulb5Data) {
//           // Extract the aggregated counts from the ULB 5 object
//           approved = ulb5Data.APPROVED || 0;
//           rejected = ulb5Data.REJECT || 0;
//           pending = ulb5Data.PENDING || 0;
//         }

//         // Use the three aggregated counts for the Doughnut chart
//         setStatusWiseData({
//           labels: ["Approved", "Rejected", "Pending"],
//           datasets: [
//             {
//               data: [approved, rejected, pending],
//               backgroundColor: [
//                 "#20c997", // Green for Approved
//                 "#ff6384", // Red for Rejected
//                 "#ffa726", // Orange for Pending
//               ],
//               borderWidth: 2,
//             },
//           ],
//         });
//       }
//     } catch (err) {
//       console.error("❌ Error fetching Status Wise data:", err);
//     }
//   };

//   // Fetch Trade Wise Applications Data (Service-wise/Status-wise)
//   const fetchTradeWiseData = async () => {
//     try {
//       const response = await apiService.post("GetTradecerti", { ulbId });

//       if (response?.data?.success && response.data.data?.length > 0) {
//         const data = response.data.data;
//         const statusCounts = {};

//         // Aggregate counts for each APPSTATUS
//         data.forEach((item) => {
//           const status = item.APPSTATUS
//             ? item.APPSTATUS.trim().toUpperCase()
//             : "UNKNOWN";

//           // ** MAPPING FIX: Added 'C' to map to 'Completed' **
//           const labelMap = {
//             A: "Approved",
//             P: "Pending",
//             R: "Rejected",
//             V: "Verified",
//             RC: " RC",
//             C: "Certified", // <-- Explicitly added mapping for status "C"
//           };

//           const readableStatus = labelMap[status] || status;

//           statusCounts[readableStatus] =
//             (statusCounts[readableStatus] || 0) + 1;
//         });

//         // Prepare chart data
//         const labels = Object.keys(statusCounts);
//         const counts = Object.values(statusCounts);

//         setTradeWiseData({
//           labels,
//           datasets: [
//             {
//               data: counts,
//               backgroundColor: [
//                 "#36A2EB",
//                 "#FFCE56",
//                 "#FF6384",
//                 "#4BC0C0",
//                 "#9966FF",
//                 "#FF9F40",
//                 "#C9CB30",
//               ],
//               borderWidth: 2,
//             },
//           ],
//         });
//       } else {
//         console.warn("⚠️ No trade data found in API response");
//       }
//     } catch (err) {
//       console.error("❌ Error fetching Trade Wise data:", err);
//     }
//   };

//   const fetchRejectedTrend = async () => {
//     try {
//       const response = await apiService.post("GetApplicationStatusTrend", {
//         ulbId,
//       });
//       if (response?.data?.success && response.data.data?.length > 0) {
//         const data = response.data.data;

//         const labels = data.map((item) => item.MONTH_NAME);
//         const rejectedCounts = data.map((item) => item.REJECT);

//         setRejectedTrendData({
//           labels,
//           datasets: [
//             {
//               label: "Rejected Applications (Monthly)",
//               data: rejectedCounts,
//               fill: false,
//               borderColor: "#ff6384",
//               backgroundColor: "#ff6384",
//               tension: 0.4,
//               pointRadius: 5,
//               pointBackgroundColor: "#ff6384",
//             },
//           ],
//         });
//       }
//     } catch (err) {
//       console.error("❌ Error fetching Rejected Trend data:", err);
//     }
//   };

//   // --- useEffect Hook to Run All Fetches ---

//   useEffect(() => {
//     fetchDashboardCounts();
//     fetchAgingReport();
//     fetchCollectionData();
//     fetchStatusWiseData();
//     fetchTradeWiseData(); // Call the trade-wise function
//     fetchRejectedTrend();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [ulbId]); // Added dependency array to run only on mount

//   // --- Calculated Values & Chart Configs ---

//   // Calculate total count for Trade-wise Applications for the title
//   const totalTradeApplications = useMemo(() => {
//     return tradeWiseData.datasets[0].data.reduce(
//       (sum, count) => sum + count,
//       0
//     );
//   }, [tradeWiseData]);

//   const agingData = {
//     labels: agingReport.map((item) => item.AGING_REPORT),
//     datasets: [
//       {
//         data: agingReport.map((item) => item.CNT),
//         backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#6f42c1"],
//         borderWidth: 2,
//       },
//     ],
//   };

//   const agingOptions = {
//     plugins: {
//       legend: { position: "right" },
//       datalabels: {
//         color: "#fff",
//         formatter: (value) => (value > 0 ? value : ""),
//         font: { weight: "bold" },
//       },
//     },
//   };

//   const collectionOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: { position: "bottom" },
//       datalabels: {
//         align: "top",
//         color: "#000",
//         font: { weight: "bold" },
//         formatter: (value) => value.toLocaleString(),
//       },
//     },
//     scales: { y: { beginAtZero: true } },
//   };

//   // Reusing a single Doughnut options object
//   const commonDoughnutOptions = {
//     plugins: {
//       legend: { position: "right" },
//       datalabels: {
//         color: "#fff",
//         font: { weight: "bold" },
//         formatter: (value) => (value > 0 ? value : ""),
//       },
//     },
//   };

//   const rejectedTrendOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { position: "top" } },
//     scales: { y: { beginAtZero: true } },
//   };

//   const summaryCards = [
//     { title: "Total Applications", count: counts.APPLINO, icon: "📋" },
//     { title: "Applications Approved", count: counts.APPROVE, icon: "✅" },
//     { title: "Applications Pending", count: counts.PENDING, icon: "⌛" },
//     { title: "Applications Rejected", count: counts.REJECT, icon: "❌" },
//     { title: "Payment Pending", count: counts.PAYMENT_PENDING, icon: "💰" },
//     { title: "Payment Done", count: counts.PAYMENT_DONE, icon: "🌞" },
//     { title: "Applications Delivered", count: counts.DELIVERED, icon: "📦" },
//   ];

//   // --- Component Render ---

//   return (
//     <div
//       className="container-fluid p-0"
//       style={{
//         overflow: "hidden",
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <Header />
//       <Navbar />

//       <div
//         style={{
//           flex: 1,
//           overflow: "auto",
//           padding: "1rem",
//           background: "#f8f9fa",
//         }}
//       >
//         {/* Summary Cards */}
//         {loading ? (
//           <div className="text-center my-5">
//             <div className="spinner-border text-primary" role="status"></div>
//             <p className="mt-2 fw-bold">Loading Dashboard...</p>
//           </div>
//         ) : (
//           <div
//             className="mt-3 mb-4"
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
//               gap: "1rem",
//             }}
//           >
//             {summaryCards.map((card, idx) => (
//               <div
//                 key={idx}
//                 className="card shadow-sm text-center"
//                 style={{
//                   borderRadius: "8px",
//                   transition: "transform 0.2s ease-in-out",
//                 }}
//               >
//                 <div className="card-body p-3">
//                   <div className="fs-2 mb-2">{card.icon}</div>
//                   <h4 className="fw-bold mb-1">{card.count}</h4>
//                   <div style={{ fontSize: "0.9rem" }}>{card.title}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* First Row */}
//         <div className="row g-4 mb-5">
//           {/* Aging Report */}
//           <div className="col-lg-6">
//             <div className="card shadow-sm p-4 h-100">
//               <h5 className="fw-bold mb-3 text-center">
//                 Application Aging Report
//               </h5>
//               <p className="text-secondary">
//                 Total Application Aging:{" "}
//                 <b>{agingReport.reduce((sum, item) => sum + item.CNT, 0)}</b>
//               </p>
//               <div className="row">
//                 <div className="col-md-6">
//                   <table className="table table-bordered table-sm text-center">
//                     <thead className="table-light">
//                       <tr>
//                         <th>Aging Report</th>
//                         <th>Count</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {agingReport.map((item, idx) => (
//                         <tr key={idx}>
//                           <td>{item.AGING_REPORT}</td>
//                           <td>{item.CNT}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//                 <div className="col-md-6 d-flex align-items-center justify-content-center">
//                   <div style={{ width: "250px", height: "250px" }}>
//                     <Doughnut data={agingData} options={agingOptions} />
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Total Collection */}
//           <div className="col-lg-6">
//             <div className="card shadow-sm p-4 h-100">
//               <h5 className="fw-bold mb-3 text-center">
//                 Total Collection by Year
//               </h5>
//               <div style={{ height: "300px" }}>
//                 <Line data={collectionData} options={collectionOptions} />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Second Row */}
//         <div className="row g-4 mb-5">
//           {/* Trade Application Status Summary (The corrected chart name) */}
//           <div className="col-lg-4">
//             <div className="card shadow-sm p-4 h-100">
//               <h5 className="fw-bold mb-3 text-center">
//                 Trade Application Status (Total: {totalTradeApplications})
//               </h5>
//               <div className="d-flex justify-content-center">
//                 <div style={{ width: "250px", height: "250px" }}>
//                   <Doughnut
//                     data={tradeWiseData}
//                     options={commonDoughnutOptions}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Status-wise (General Status) */}
//           <div className="col-lg-4">
//             <div className="card shadow-sm p-4 h-100">
//               <h5 className="fw-bold mb-3 text-center">General Status Count</h5>
//               <div className="d-flex justify-content-center">
//                 <div style={{ width: "250px", height: "250px" }}>
//                   <Doughnut
//                     data={statusWiseData}
//                     options={commonDoughnutOptions}
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Rejected Trend */}
//           <div className="col-lg-4">
//             <div className="card shadow-sm p-4 h-100">
//               <h5 className="fw-bold mb-3 text-center">
//                 Rejected Applications Trend
//               </h5>
//               <div style={{ height: "250px" }}>
//                 <Line data={rejectedTrendData} options={rejectedTrendOptions} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





import React, { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Header from "../../HOC/Header/Header";
import Navbar from "../../HOC/Navbar/Navbar";
import apiService from "../../../apiService";
import { useAuth } from "../../Context/AuthContext"; // Import useAuth

// Register Chart.js components and plugins
ChartJS.register(
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const Dashboard = () => {
  // ✅ Get user from AuthContext
  const { user } = useAuth();
  // ✅ Safely get and parse ulbId
  const ulbId = user?.ulbId ? parseInt(user.ulbId, 10) : null;

  const [counts, setCounts] = useState({
    APPLINO: 0,
    APPROVE: 0,
    PENDING: 0,
    REJECT: 0,
    PAYMENT_PENDING: 0,
    PAYMENT_DONE: 0,
    DELIVERED: 0,
  });

  const [agingReport, setAgingReport] = useState([]);
  const [collectionData, setCollectionData] = useState({
    labels: [],
    datasets: [
      {
        label: "Total Collection (Yearly)",
        data: [],
        fill: true,
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        borderColor: "rgba(54, 162, 235, 1)",
        tension: 0.4,
      },
    ],
  });

  const [statusWiseData, setStatusWiseData] = useState({
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ["#20c997", "#ff6384", "#ffa726"],
        borderWidth: 2,
      },
    ],
  });

  const [tradeWiseData, setTradeWiseData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#36A2EB",
          "#FFCE56",
          "#FF6384",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CB30",
        ],
        borderWidth: 2,
      },
    ],
  });

  const [rejectedTrendData, setRejectedTrendData] = useState({
    labels: [],
    datasets: [
      {
        label: "Rejected Applications (Monthly)",
        data: [],
        fill: false,
        borderColor: "#ff6384",
        backgroundColor: "#ff6384",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#ff6384",
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  // Removed hardcoded ulbId = 5;

  // --- API Fetch Functions ---

  // Fetch Dashboard Counts
  const fetchDashboardCounts = async () => {
    if (!ulbId) return; // ✅ Check for ulbId
    try {
      setLoading(true);
      const response = await apiService.post("GetDashboardCount", { ulbId });
      if (response?.data?.success && response.data.data?.length > 0) {
        const data = response.data.data;
        const totals = data.reduce(
          (acc, curr) => ({
            APPLINO: acc.APPLINO + (curr.APPLINO || 0),
            APPROVE: acc.APPROVE + (curr.APPROVE || 0),
            PENDING: acc.PENDING + (curr.PENDING || 0),
            REJECT: acc.REJECT + (curr.REJECT || 0),
            PAYMENT_PENDING: acc.PAYMENT_PENDING + (curr.PAYMENT_PENDING || 0),
            PAYMENT_DONE: acc.PAYMENT_DONE + (curr.PAYMENT_DONE || 0),
            DELIVERED: acc.DELIVERED + (curr.DELIVERED || 0),
          }),
          // ✅ Start with initial zero values for correct reduction
          {
            APPLINO: 0,
            APPROVE: 0,
            PENDING: 0,
            REJECT: 0,
            PAYMENT_PENDING: 0,
            PAYMENT_DONE: 0,
            DELIVERED: 0,
          }
        );
        setCounts(totals);
      }
    } catch (err) {
      console.error("❌ Error fetching dashboard counts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Aging Report
  const fetchAgingReport = async () => {
    if (!ulbId) return; // ✅ Check for ulbId
    try {
      const response = await apiService.post("GetAgeingReport", { ulbId });
      if (response?.data?.success && response.data.data?.length > 0) {
        setAgingReport(response.data.data);
      }
    } catch (err) {
      console.error("❌ Error fetching Aging Report:", err);
    }
  };

  // Fetch Collection Data
  const fetchCollectionData = async () => {
    if (!ulbId) return; // ✅ Check for ulbId
    try {
      const response = await apiService.post("GetMonthWise", { ulbId });
      if (response?.data?.success && response.data.data?.length > 0) {
        const data = response.data.data;

        const collectionByYear = data.reduce((acc, curr) => {
          // Assuming APPLIDT contains the year or can be parsed to a year
          const year = curr.APPLIDT;
          acc[year] = (acc[year] || 0) + (curr.TOT_COLL || 0);
          return acc;
        }, {});

        setCollectionData({
          labels: Object.keys(collectionByYear),
          datasets: [
            {
              label: "Total Collection (Yearly)",
              data: Object.values(collectionByYear),
              fill: true,
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              borderColor: "rgba(54, 162, 235, 1)",
              tension: 0.4,
            },
          ],
        });
      }
    } catch (err) {
      console.error("❌ Error fetching Collection data:", err);
    }
  };

  // Fetch Status Wise Data
  const fetchStatusWiseData = async () => {
    if (!ulbId) return; // ✅ Check for ulbId
    try {
      const response = await apiService.post("GetApplicationStatus", {
        ulbId,
      });

      if (response?.data?.success && response.data.data?.length > 0) {
        const allData = response.data.data;
        // Find the specific ULB data
        const ulbData = allData.find((item) => item.ULBID === ulbId);

        const approved = ulbData?.APPROVED || 0;
        const rejected = ulbData?.REJECT || 0;
        const pending = ulbData?.PENDING || 0;

        // Use the three aggregated counts for the Doughnut chart
        setStatusWiseData({
          labels: ["Approved", "Rejected", "Pending"],
          datasets: [
            {
              data: [approved, rejected, pending],
              backgroundColor: [
                "#20c997", // Green for Approved
                "#ff6384", // Red for Rejected
                "#ffa726", // Orange for Pending
              ],
              borderWidth: 2,
            },
          ],
        });
      }
    } catch (err) {
      console.error("❌ Error fetching Status Wise data:", err);
    }
  };

  // Fetch Trade Wise Applications Data (Service-wise/Status-wise)
  const fetchTradeWiseData = async () => {
    if (!ulbId) return; // ✅ Check for ulbId
    try {
      const response = await apiService.post("GetTradecerti", { ulbId });

      if (response?.data?.success && response.data.data?.length > 0) {
        const data = response.data.data;
        const statusCounts = {};

        // Aggregate counts for each APPSTATUS
        data.forEach((item) => {
          const status = item.APPSTATUS
            ? item.APPSTATUS.trim().toUpperCase()
            : "UNKNOWN";

          const labelMap = {
            A: "Approved",
            P: "Pending",
            R: "Rejected",
            V: "Verified",
            RC: "RC",
            C: "Certified", // Explicitly added mapping for status "C"
          };

          const readableStatus = labelMap[status] || status;

          statusCounts[readableStatus] =
            (statusCounts[readableStatus] || 0) + 1;
        });

        // Prepare chart data
        const labels = Object.keys(statusCounts);
        const counts = Object.values(statusCounts);

        setTradeWiseData({
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: [
                "#36A2EB",
                "#FFCE56",
                "#FF6384",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
                "#C9CB30",
              ],
              borderWidth: 2,
            },
          ],
        });
      } else {
        console.warn("⚠️ No trade data found in API response");
      }
    } catch (err) {
      console.error("❌ Error fetching Trade Wise data:", err);
    }
  };

  const fetchRejectedTrend = async () => {
    if (!ulbId) return; // ✅ Check for ulbId
    try {
      const response = await apiService.post("GetApplicationStatusTrend", {
        ulbId,
      });
      if (response?.data?.success && response.data.data?.length > 0) {
        const data = response.data.data;

        const labels = data.map((item) => item.MONTH_NAME);
        const rejectedCounts = data.map((item) => item.REJECT);

        setRejectedTrendData({
          labels,
          datasets: [
            {
              label: "Rejected Applications (Monthly)",
              data: rejectedCounts,
              fill: false,
              borderColor: "#ff6384",
              backgroundColor: "#ff6384",
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: "#ff6384",
            },
          ],
        });
      }
    } catch (err) {
      console.error("❌ Error fetching Rejected Trend data:", err);
    }
  };

  // --- useEffect Hook to Run All Fetches ---

  useEffect(() => {
    // ✅ Only run fetches if ulbId is valid
    if (ulbId) {
      fetchDashboardCounts();
      fetchAgingReport();
      fetchCollectionData();
      fetchStatusWiseData();
      fetchTradeWiseData();
      fetchRejectedTrend();
    }
  }, [ulbId]); // ✅ Depend on ulbId so it re-runs when the context loads the user

  // --- Calculated Values & Chart Configs ---

  // Calculate total count for Trade-wise Applications for the title
  const totalTradeApplications = useMemo(() => {
    return tradeWiseData.datasets[0].data.reduce(
      (sum, count) => sum + count,
      0
    );
  }, [tradeWiseData]);

  const agingData = {
    labels: agingReport.map((item) => item.AGING_REPORT),
    datasets: [
      {
        data: agingReport.map((item) => item.CNT),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#6f42c1"],
        borderWidth: 2,
      },
    ],
  };

  const commonDoughnutOptions = {
    plugins: {
      legend: { position: "right" },
      datalabels: {
        color: "#fff",
        font: { weight: "bold" },
        formatter: (value) => (value > 0 ? value : ""),
      },
    },
  };

  const collectionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      datalabels: {
        align: "top",
        color: "#000",
        font: { weight: "bold" },
        formatter: (value) => value.toLocaleString(),
      },
    },
    scales: { y: { beginAtZero: true } },
  };

  const rejectedTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" } },
    scales: { y: { beginAtZero: true } },
  };

  const summaryCards = [
    { title: "Total Applications", count: counts.APPLINO, icon: "📋" },
    { title: "Applications Approved", count: counts.APPROVE, icon: "✅" },
    { title: "Applications Pending", count: counts.PENDING, icon: "⌛" },
    { title: "Applications Rejected", count: counts.REJECT, icon: "❌" },
    { title: "Payment Pending", count: counts.PAYMENT_PENDING, icon: "💰" },
    { title: "Payment Done", count: counts.PAYMENT_DONE, icon: "🌞" },
    { title: "Applications Delivered", count: counts.DELIVERED, icon: "📦" },
  ];

  // --- Component Render ---

  return (
    <>
      <Header />
      <Navbar />

      <div
        className="container-fluid p-0"
        style={{
          overflow: "hidden",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1rem",
            background: "#f8f9fa",
          }}
        >
          {/* Loading / Content */}
          {loading || !ulbId ? ( // Show spinner if loading or ulbId isn't available yet
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 fw-bold">Loading Dashboard...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div
                className="mt-3 mb-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                }}
              >
                {summaryCards.map((card, idx) => (
                  <div
                    key={idx}
                    className="card shadow-sm text-center"
                    style={{
                      borderRadius: "8px",
                    }}
                  >
                    <div className="card-body p-3">
                      <div className="fs-2 mb-2">{card.icon}</div>
                      <h4 className="fw-bold mb-1">{card.count}</h4>
                      <div style={{ fontSize: "0.9rem" }}>{card.title}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* First Row */}
              <div className="row g-4 mb-5">
                {/* Aging Report */}
                <div className="col-lg-6">
                  <div className="card shadow-sm p-4 h-100">
                    <h5 className="fw-bold mb-3 text-center">
                      Application Aging Report
                    </h5>
                    <p className="text-secondary">
                      Total Application Aging:{" "}
                      <b>
                        {agingReport.reduce((sum, item) => sum + item.CNT, 0)}
                      </b>
                    </p>
                    <div className="row">
                      <div className="col-md-6">
                        <table className="table table-bordered table-sm text-center">
                          <thead className="table-light">
                            <tr>
                              <th>Aging Report</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agingReport.map((item, idx) => (
                              <tr key={idx}>
                                <td>{item.AGING_REPORT}</td>
                                <td>{item.CNT}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="col-md-6 d-flex align-items-center justify-content-center">
                        <div style={{ width: "250px", height: "250px" }}>
                          <Doughnut
                            data={agingData}
                            options={commonDoughnutOptions}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Collection */}
                <div className="col-lg-6">
                  <div className="card shadow-sm p-4 h-100">
                    <h5 className="fw-bold mb-3 text-center">
                      Total Collection by Year
                    </h5>
                    <div style={{ height: "300px" }}>
                      <Line data={collectionData} options={collectionOptions} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Second Row */}
              <div className="row g-4 mb-5">
                {/* Trade Application Status Summary */}
                <div className="col-lg-4">
                  <div className="card shadow-sm p-4 h-100">
                    <h5 className="fw-bold mb-3 text-center">
                      Trade Application Status (Total: {totalTradeApplications})
                    </h5>
                    <div className="d-flex justify-content-center">
                      <div style={{ width: "250px", height: "250px" }}>
                        <Doughnut
                          data={tradeWiseData}
                          options={commonDoughnutOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status-wise (General Status) */}
                <div className="col-lg-4">
                  <div className="card shadow-sm p-4 h-100">
                    <h5 className="fw-bold mb-3 text-center">
                      General Status Count
                    </h5>
                    <div className="d-flex justify-content-center">
                      <div style={{ width: "250px", height: "250px" }}>
                        <Doughnut
                          data={statusWiseData}
                          options={commonDoughnutOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rejected Trend */}
                <div className="col-lg-4">
                  <div className="card shadow-sm p-4 h-100">
                    <h5 className="fw-bold mb-3 text-center">
                      Rejected Applications Trend
                    </h5>
                    <div style={{ height: "250px" }}>
                      <Line
                        data={rejectedTrendData}
                        options={rejectedTrendOptions}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;