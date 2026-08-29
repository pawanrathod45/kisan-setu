import { useEffect, useState, useRef, useCallback } from "react";
import API from "../services/api";

export const useDashboardData = (user) => {
  const [weather, setWeather] = useState(null);
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [market, setMarket] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const city = user?.location || "Pune";
      const userCrop = user?.crop || "Wheat";

      const [weatherRes, cropsRes, tasksRes, alertsRes, marketRes, dashRes] = await Promise.allSettled([
        API.get(`/weather?city=${encodeURIComponent(city)}`).catch(err => ({ data: null })),
        API.get("/crops").catch(err => ({ data: [] })),
        API.get("/tasks").catch(err => ({ data: [] })),
        API.get("/alerts").catch(err => ({ data: [] })),
        API.get(`/market?crop=${encodeURIComponent(userCrop)}`).catch(err => ({ data: null })),
        API.get("/dashboard").catch(err => ({ data: null }))
      ]);

      if (weatherRes.status === 'fulfilled' && weatherRes.value?.data) {
        setWeather(weatherRes.value.data);
      }

      if (cropsRes.status === 'fulfilled' && Array.isArray(cropsRes.value?.data)) {
        setCrops(cropsRes.value.data);
      }

      if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value?.data)) {
        setTasks(tasksRes.value.data);
      }

      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value?.data)) {
        setAlerts(alertsRes.value.data);
      }

      if (marketRes.status === 'fulfilled' && marketRes.value?.data) {
        setMarket(marketRes.value.data);
      }

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setData(dashRes.value.data);
      }

      setLoading(false);
      hasFetched.current = true;
    } catch (err) {
      console.warn("Dashboard fetch non-fatal notice:", err?.message || err);
      setLoading(false);
      hasFetched.current = true;
    }
  }, [user?.location, user?.crop]);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchAll();
    }
  }, [fetchAll]);

  const fetchMarketForCrop = async (cropName) => {
    try {
      const res = await API.get(`/market?crop=${encodeURIComponent(cropName)}`);
      if (res.data) {
        setMarket(res.data);
      }
    } catch (err) {
      console.warn("Market fetch error for crop:", cropName, err);
    }
  };

  const addTask = async (newTaskData) => {
    const tempId = 'temp_' + Date.now();
    const optimisticTask = {
      _id: tempId,
      id: tempId,
      title: newTaskData.title || newTaskData.text,
      category: newTaskData.category || 'field',
      status: 'pending',
      done: false,
      date: new Date().toISOString().split('T')[0]
    };
    
    setTasks(prev => [optimisticTask, ...prev]);

    try {
      const res = await API.post('/tasks', newTaskData);
      if (res.data) {
        setTasks(prev => prev.map(t => (t._id === tempId ? res.data : t)));
      }
    } catch (err) {
      console.error("Failed to add task to server:", err);
    }
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus ? "pending" : "completed";
    const isCompleted = !currentStatus;
    
    setTasks(prev =>
      prev.map(t =>
        (t._id === taskId || t.id === taskId)
          ? { ...t, status: newStatus, done: isCompleted }
          : t
      )
    );

    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus, completed: isCompleted });
    } catch (err) {
      console.warn("Failed to persist task status change:", err);
    }
  };

  const dismissAlert = async (alertId) => {
    setAlerts(prev => prev.filter(a => (a._id !== alertId && a.id !== alertId)));
    try {
      await API.put(`/alerts/${alertId}`, { read: true });
    } catch (err) {
      console.warn("Alert dismiss error:", err);
    }
  };

  return {
    weather,
    crops,
    tasks,
    alerts,
    market,
    data,
    loading,
    error,
    refreshData: fetchAll,
    toggleTaskStatus,
    fetchMarketForCrop,
    addTask,
    dismissAlert
  };
};