// src/hooks/useIP.js
import { useState, useEffect } from "react";
import GetIPAddress from "../utils/ipHelper"; // Import the getIPAddress utility

// Custom hook to fetch and return the IP address
const useIP = () => {
  const [ipAddress, setIpAddress] = useState("");

  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await GetIPAddress(); // Fetch the IP address
      setIpAddress(ip); // Store it in the state
    };

    fetchIpAddress(); // Call the function to fetch the IP address when the component mounts
  }, []); // Empty dependency array ensures this effect runs only once

  return ipAddress; // Return the IP address to use it in any component
};

export default useIP;
