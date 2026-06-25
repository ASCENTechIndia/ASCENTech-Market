import React, { useEffect, useState } from "react";
import TableComponent from "./TableComponent";
import ChartComponent from "./ChartComponent";
import "./styles.css"; // External CSS

import { useAuth } from "../../Context/AuthContext";

const CardComponent = () => {
  const { user } = useAuth();
  const ulbid = user?.ulbId;

  const [agingData, setAgingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgingData = async () => {
      if (!ulbid) return; // Wait until ulbid is available

      try {
        const res = await fetch(
          `http://localhost:5000/agingapplications?ulbid=${ulbid}`
        );
        const json = await res.json();
        
        const initialBuckets = {
          "0 > 3 days": 0,
          "4 > 10 days": 0,
          "11 > 30 days": 0,
          "30+ days": 0,
        };

        if (json.success && Array.isArray(json.data)) {
          const grouped = json.data.reduce((acc, item) => {
            const bucket = item.AGING_BUCKET;
            if (acc.hasOwnProperty(bucket)) {
              acc[bucket] = (acc[bucket] || 0) + 1;
            }
            return acc;
          }, initialBuckets);

          const formatted = Object.entries(grouped).map(([bucket, count]) => ({
            dueIn: bucket,
            count,
          }));

          setAgingData(formatted);
        } else {
          const formatted = Object.entries(initialBuckets).map(([bucket, count]) => ({
            dueIn: bucket,
            count,
          }));
          setAgingData(formatted);
        }
      } catch (error) {
        console.error("Error fetching aging data:", error);
        const fallbackBuckets = {
          "0 > 3 days": 0,
          "4 > 10 days": 0,
          "11 > 30 days": 0,
          "30+ days": 0,
        };
        const formatted = Object.entries(fallbackBuckets).map(([bucket, count]) => ({
          dueIn: bucket,
          count,
        }));
        setAgingData(formatted);
      } finally {
        setLoading(false);
      }
    };

    fetchAgingData();
  }, [ulbid]); // Run whenever ulbid changes

  return (
    <div className="cardContainer">
      <h2 className="heading">Application Aging Report</h2>
      <div className="content-container">
        <div className="table-section">
          <TableComponent data={agingData} loading={loading} />
        </div>
        <div className="chart-section">
          <ChartComponent data={agingData} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default CardComponent;
