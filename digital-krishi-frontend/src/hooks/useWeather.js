import { useEffect, useState, useRef } from "react";
import axios from "axios";

export const useWeather = (location) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const city = location || "Pune";
        const res = await axios.get(`/api/weather?city=${city}`);
        setWeather(res.data);
        setLoading(false);
        hasFetched.current = true;
      } catch (err) {
        console.error("Weather error:", err);
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

    fetchWeather();

    const interval = setInterval(() => {
      hasFetched.current = false;
      fetchWeather();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [location]);

  return { weather, loading, error };
};
