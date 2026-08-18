import { useEffect, useState, useRef } from "react";
import axios from "axios";
import API from "../services/api";

export const useDashboardData = (user) => {
  const [weather, setWeather] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    const fetchAll = async () => {
      try {
        setLoading(true);
        
        // Fetch weather
        const city = user?.location || "Pune";
        const weatherRes = await axios.get(`/api/weather?city=${city}`);
        setWeather(weatherRes.data);
        
        // Fetch dashboard data
        const dashboardRes = await API.get("/dashboard");
        setData(dashboardRes.data);
        
        setLoading(false);
        hasFetched.current = true;
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        setWeather({
          temperature: "--",
          humidity: "--",
          windSpeed: "--",
          condition: "Unknown"
        });
        setLoading(false);
        hasFetched.current = true;
      }
    };

    fetchAll();

    const interval = setInterval(() => {
      hasFetched.current = false;
      fetchAll();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [user?.location]);

  return { weather, data, loading, error };
};