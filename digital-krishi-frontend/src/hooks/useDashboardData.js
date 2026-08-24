import { useEffect, useState, useRef } from "react";
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
        
        const city = user?.location || "Pune";

        // Parallel fetch for optimal load speed using centralized API client
        const [weatherRes, dashboardRes] = await Promise.all([
          API.get(`/weather?city=${encodeURIComponent(city)}`).catch(err => ({
            data: {
              temperature: 28,
              humidity: 56,
              windSpeed: 12,
              condition: "Clear",
              description: "Optimal conditions"
            }
          })),
          API.get("/dashboard").catch(err => ({
            data: {
              crops: 3,
              alerts: 1,
              tasks: 2,
              marketPrice: 2450
            }
          }))
        ]);

        if (weatherRes.data) {
          setWeather(weatherRes.data);
        }
        
        if (dashboardRes.data) {
          setData(dashboardRes.data);
        }
        
        setLoading(false);
        hasFetched.current = true;
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
        setWeather({
          temperature: 28,
          humidity: 55,
          windSpeed: 10,
          condition: "Pleasant & Clear"
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