// src/hooks/useDashboardData.js

import { useEffect, useState } from "react";
import axios from "axios";

export const useDashboardData = (user) => {
  const [weather, setWeather] = useState(null);
  const [market, setMarket] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        const city = user?.location || "Pune";
        
        console.log("Fetching weather for:", city);
        const res = await axios.get(`/api/weather?city=${city}`);
        console.log("Weather response:", res.data);
        
        setWeather(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Weather fetch error:", err);
        console.error("Error details:", err.response?.data || err.message);
        setError(err.message);
        setLoading(false);
        
        // Set fallback data on error
        setWeather({
          temperature: "--",
          humidity: "--",
          windSpeed: "--",
          condition: "Unknown",
          description: "Unable to fetch weather"
        });
      }
    };

    fetchWeather();

    // auto refresh every 1 min
    const interval = setInterval(fetchWeather, 60000);
    return () => clearInterval(interval);

  }, [user]);

  return { weather, market, alerts, loading, error };
};