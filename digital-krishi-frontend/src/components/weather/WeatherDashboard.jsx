// WeatherDashboard.jsx - Complete Premium AgriTech Weather Intelligence Platform

import React, { useState, useEffect, useCallback } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import weatherService from '../../services/weatherService';
import { useLanguage } from '../../context/LanguageContext';
import './WeatherDashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const WeatherDashboard = () => {
  const { t, language } = useLanguage();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [hourly, setHourly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = user.location || 'Pune';

  const getCurrentDateTime = useCallback(() => {
    const now = new Date();
    const localeStr = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    return {
      date: now.toLocaleDateString(localeStr, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: now.toLocaleTimeString(localeStr, { hour: '2-digit', minute: '2-digit' })
    };
  }, [language]);

  const [currentDateTime, setCurrentDateTime] = useState(getCurrentDateTime());

  useEffect(() => {
    setCurrentDateTime(getCurrentDateTime());
    const timer = setInterval(() => {
      setCurrentDateTime(getCurrentDateTime());
    }, 60000);
    return () => clearInterval(timer);
  }, [getCurrentDateTime]);

  const fetchWeatherData = useCallback(async () => {
    try {
      setIsSyncing(true);
      setLoading(true);
      setError(null);
      
      const [weatherData, forecastData, hourlyData] = await Promise.all([
        weatherService.getWeather(location),
        weatherService.getForecast(location),
        weatherService.getHourlyForecast(location)
      ]);
      
      setWeather(weatherData);
      setForecast(forecastData);
      setHourly(hourlyData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 300000);
    return () => clearInterval(interval);
  }, [fetchWeatherData]);

  // Generate weather alerts based on live data
  const getWeatherAlerts = () => {
    if (!weather) return [];
    const alerts = [];
    
    if (weather.temperature > 38) {
      alerts.push({ type: 'danger', message: '🔥 Extreme Heat Warning! Temperatures above 38°C. Ensure crop hydration.' });
    } else if (weather.temperature > 35) {
      alerts.push({ type: 'warning', message: '☀️ Heat Alert: High temperatures expected. Increase irrigation.' });
    }
    
    if (weather.rainProbability > 70) {
      alerts.push({ type: 'danger', message: '🌧️ Heavy Rain Warning: 70%+ chance. Postpone outdoor activities.' });
    } else if (weather.rainProbability > 50) {
      alerts.push({ type: 'warning', message: '💧 Rain Expected Soon: Prepare drainage systems.' });
    }
    
    if (weather.windSpeed > 20) {
      alerts.push({ type: 'danger', message: '💨 Strong Wind Warning: Avoid pesticide spraying.' });
    } else if (weather.windSpeed > 15) {
      alerts.push({ type: 'warning', message: '🌬️ Moderate Winds: Careful with spraying operations.' });
    }
    
    if (weather.uvIndex > 8) {
      alerts.push({ type: 'danger', message: '☢️ Extreme UV Index: Limit outdoor work between 10 AM - 3 PM.' });
    } else if (weather.uvIndex > 6) {
      alerts.push({ type: 'warning', message: '🛡️ High UV Levels: Use protective gear for field workers.' });
    }
    
    return alerts.slice(0, 3);
  };

  // AI-Powered Smart Farming Recommendations
  const getSmartRecommendations = () => {
    if (!weather) return [];
    const recommendations = [];
    const { temperature, humidity, windSpeed, rainProbability, uvIndex, soilMoistureSuggestion = 65 } = weather;

    // Irrigation Recommendation
    if (rainProbability > 60) {
      recommendations.push({ icon: '💧❌', title: 'Skip Irrigation', desc: `${rainProbability}% rain expected. Save water resources.`, priority: 'high' });
    } else if (temperature > 35 && humidity < 40) {
      recommendations.push({ icon: '💧⬆️', title: 'Increase Irrigation', desc: `Hot & dry conditions. Add +25% water to fields.`, priority: 'high' });
    } else if (temperature > 30 && humidity < 50) {
      recommendations.push({ icon: '💧📈', title: 'Supplemental Water', desc: `Moderate heat stress. Increase irrigation by 15%.`, priority: 'medium' });
    } else {
      recommendations.push({ icon: '💧✅', title: 'Optimal Moisture', desc: `Soil moisture at ${soilMoistureSuggestion}%. Maintain current schedule.`, priority: 'low' });
    }

    // Spray Recommendation
    if (windSpeed > 15) {
      recommendations.push({ icon: '🌿❌', title: 'Avoid Spraying', desc: `Winds at ${windSpeed} km/h. Risk of drift.`, priority: 'high' });
    } else if (rainProbability < 20 && temperature < 32 && windSpeed < 10) {
      recommendations.push({ icon: '🌿✅', title: 'Ideal Spray Window', desc: `Perfect conditions for pesticide/fertilizer application.`, priority: 'low' });
    } else if (rainProbability < 40 && windSpeed < 12) {
      recommendations.push({ icon: '🌿⚠️', title: 'Cautious Spraying', desc: `Acceptable conditions. Spray early morning.`, priority: 'medium' });
    }

    // Harvest Timing
    if (rainProbability > 50) {
      recommendations.push({ icon: '🌾⚠️', title: 'Delay Harvest', desc: `Rain expected. Premature harvest risks quality.`, priority: 'high' });
    } else if (humidity < 70 && windSpeed < 10 && rainProbability < 30) {
      recommendations.push({ icon: '🌾✅', title: 'Excellent Harvest Window', desc: `Perfect drying conditions. Ideal for harvest.`, priority: 'low' });
    } else if (humidity > 75) {
      recommendations.push({ icon: '🌾⏳', title: 'Monitor Moisture', desc: `High humidity. Wait for drier conditions.`, priority: 'medium' });
    }

    // Disease Risk Assessment
    let diseaseRisk = 'Low';
    let diseaseIcon = '🟢';
    if (humidity > 80 && temperature > 22 && temperature < 30) {
      diseaseRisk = 'Critical';
      diseaseIcon = '🔴';
      recommendations.push({ icon: '🦠🔴', title: 'Critical Disease Risk', desc: `High humidity + ideal temp for fungal growth. Apply preventive fungicide.`, priority: 'high' });
    } else if (humidity > 70 && (temperature > 20 && temperature < 32)) {
      diseaseRisk = 'High';
      diseaseIcon = '🟠';
      recommendations.push({ icon: '🦠⚠️', title: 'High Disease Risk', desc: `Monitor for blight and mildew. Consider preventive spray.`, priority: 'medium' });
    } else if (humidity > 60) {
      recommendations.push({ icon: '🦠👀', title: 'Moderate Disease Risk', desc: `Regular crop monitoring recommended.`, priority: 'low' });
    }

    // Pest Risk Alert
    if (temperature > 28 && humidity > 60) {
      recommendations.push({ icon: '🐛⚠️', title: 'Pest Pressure Rising', desc: `Warm & humid conditions favor pest multiplication.`, priority: 'medium' });
    }
    if (temperature > 32 && humidity < 45) {
      recommendations.push({ icon: '🕷️🔥', title: 'Mite Risk Alert', desc: `Hot & dry conditions ideal for spider mites.`, priority: 'medium' });
    }

    // UV Protection
    if (uvIndex > 7) {
      recommendations.push({ icon: '☀️🛡️', title: 'High UV Alert', desc: `UV Index ${uvIndex}. Protect workers with hats/sunscreen.`, priority: 'medium' });
    }

    // Crop Stress Indicator
    let stressLevel = 'Normal';
    if (temperature > 36 || (temperature > 32 && humidity < 35)) {
      stressLevel = 'Severe';
      recommendations.push({ icon: '🌡️⚠️', title: 'Severe Crop Stress', desc: `Heat stress detected. Increase irrigation immediately.`, priority: 'high' });
    } else if (temperature > 33 || (temperature > 30 && humidity < 45)) {
      stressLevel = 'Moderate';
      recommendations.push({ icon: '🌡️📊', title: 'Moderate Crop Stress', desc: `Monitor crops for wilting signs.`, priority: 'medium' });
    }

    // Best Farming Action Today
    let bestAction = '';
    if (rainProbability > 60) bestAction = 'Indoor operations & soil preparation';
    else if (windSpeed < 10 && rainProbability < 30 && temperature < 35) bestAction = 'Full field operations - Spraying, Fertilizing, Harvesting';
    else if (temperature > 35) bestAction = 'Early morning/late evening irrigation';
    else bestAction = 'Regular field monitoring & maintenance';
    
    recommendations.unshift({ icon: '🎯', title: 'Best Action Today', desc: bestAction, priority: 'high' });

    return recommendations.slice(0, 8);
  };

  // Generate 24-hour forecast summary
  const get24HourSummary = () => {
    if (!hourly || hourly.length === 0) return [];
    return hourly.slice(0, 12).map(h => ({
      time: h.time,
      temp: h.temp,
      icon: h.temp > 35 ? '🔥' : h.temp > 30 ? '☀️' : h.temp > 25 ? '🌤️' : h.temp > 20 ? '🌥️' : '🌙',
      condition: h.condition || 'Clear'
    }));
  };

  if (loading && !weather) {
    return (
      <div className="loading-state">
        <div className="spinner-premium"></div>
        <p>Loading weather intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>⚠️ {error}</p>
        <button onClick={fetchWeatherData} className="refresh-btn-premium">Retry</button>
      </div>
    );
  }

  if (!weather || !forecast || !hourly) return null;

  const alerts = getWeatherAlerts();
  const recommendations = getSmartRecommendations();
  const hourlySummary = get24HourSummary();

  // Chart Data Configurations
  const tempTrendData = {
    labels: forecast.map(f => f.day),
    datasets: [
      {
        label: `${t('temperature', 'Max Temp')} (°C)`,
        data: forecast.map(f => f.tempMax || f.temp),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.08)',
        borderWidth: 2.5,
        tension: 0.35,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#16a34a',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      },
      {
        label: `${t('temperature', 'Min Temp')} (°C)`,
        data: forecast.map(f => f.tempMin || Math.max(15, (f.temp || 25) - 5)),
        borderColor: '#0284c7',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [4, 4],
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: '#0284c7'
      }
    ]
  };

  const rainForecastData = {
    labels: forecast.map(f => f.day),
    datasets: [{
      label: `${t('precipitation', 'Rain Probability')} (%)`,
      data: forecast.map(f => f.rain !== undefined ? f.rain : 0),
      backgroundColor: forecast.map(f => (f.rain || 0) > 70 ? '#0284c7' : (f.rain || 0) > 40 ? '#38bdf8' : '#bae6fd'),
      borderRadius: 6,
      maxBarThickness: 36
    }]
  };

  const hourlyTempData = {
    labels: hourly.slice(0, 12).map(h => h.time),
    datasets: [{
      label: `${t('temperature', 'Temperature')} (°C)`,
      data: hourly.slice(0, 12).map(h => h.temp),
      borderColor: '#d97706',
      backgroundColor: 'rgba(217, 119, 6, 0.1)',
      borderWidth: 2.5,
      tension: 0.35,
      fill: true,
      pointRadius: 3,
      pointBackgroundColor: '#d97706'
    }]
  };

  const humidityWindData = {
    labels: forecast.map(f => f.day),
    datasets: [
      {
        label: `${t('humidity', 'Humidity')} (%)`,
        data: forecast.map(f => f.humidity),
        backgroundColor: '#3b82f6',
        borderRadius: 5,
        maxBarThickness: 18
      },
      {
        label: `${t('wind', 'Wind Speed')} (km/h)`,
        data: forecast.map(f => f.wind),
        backgroundColor: '#22c55e',
        borderRadius: 5,
        maxBarThickness: 18
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 11, weight: '600', family: 'system-ui, -apple-system, sans-serif' },
          usePointStyle: true,
          boxWidth: 8,
          padding: 10
        }
      },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12, weight: '700' },
        bodyFont: { size: 12 }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { font: { size: 10.5 }, maxTicksLimit: 6 }
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10.5, weight: '600' },
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7
        }
      }
    }
  };

  const rainChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        ...chartOptions.scales.y,
        max: 100,
        min: 0,
        ticks: { callback: v => v + '%', font: { size: 10.5 }, maxTicksLimit: 6 }
      }
    }
  };

  return (
    <div className="weather-dashboard">
      {/* Premium Header */}
      <div className="dashboard-header-premium">
        <div className="header-left">
          <div className="animated-weather-icon">
            {weather.temperature > 35 ? '🔥' : weather.rainProbability > 50 ? '🌧️' : weather.temperature > 30 ? '☀️' : '🌤️'}
          </div>
          <div className="header-title">
            <h1>{t('weatherIntelPlatform', 'Weather Intelligence')}</h1>
            <p>{t('precisionAgroMeteorology', 'AI-Powered Precision Agro-Meteorology Insights')}</p>
          </div>
          <div className="badges">
            <span className="live-badge">🔴 {t('live', 'LIVE DATA')}</span>
            <span className="location-badge">📍 {weather.location}</span>
          </div>
        </div>
        <div className="header-right">
          <div className="datetime">
            <div className="current-date">{currentDateTime.date}</div>
            <div className="current-time">
              {t('updated', 'Updated')}: {lastUpdated ? lastUpdated.toLocaleTimeString(language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }) : t('justNow', 'Just now')}
            </div>
          </div>
          <div className="header-actions-row">
            <button onClick={fetchWeatherData} className="refresh-btn-premium" disabled={isSyncing}>
              {isSyncing ? `⟳ ${t('loading', 'Syncing...')}` : `⟳ ${t('refresh', 'Refresh')}`}
            </button>
            <div className="sync-status">
              <span className="sync-dot"></span>
              <span>{t('autoSync', 'Auto-sync')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Weather + Recommendations */}
      <div className="main-grid-premium">
        {/* Left: Weather Card */}
        <div className="weather-card-premium">
          <div className="current-weather-premium">
            <div className="temp-section">
              <div className="current-temp-premium">{weather.temperature}°C</div>
              <div className="condition-text">{weather.description}</div>
              <div className="feels-like">{t('feelsLike', 'Feels like')} {weather.feelsLike}°C</div>
            </div>
            <div className="weather-icon-large">
              {weather.temperature > 35 ? '🔥☀️' : weather.rainProbability > 50 ? '🌧️💧' : weather.temperature > 25 ? '🌤️🌿' : '🌥️🌱'}
            </div>
          </div>

          {/* Premium Stats Grid */}
          <div className="stats-grid-premium">
            <div className="stat-card"><div className="stat-icon">🌡️</div><div className="stat-label">{t('temperature', 'Temp')}</div><div className="stat-value">{weather.temperature}°C</div></div>
            <div className="stat-card"><div className="stat-icon">💧</div><div className="stat-label">{t('humidity', 'Humidity')}</div><div className="stat-value">{weather.humidity}%</div></div>
            <div className="stat-card"><div className="stat-icon">💨</div><div className="stat-label">{t('wind', 'Wind')}</div><div className="stat-value">{weather.windSpeed} km/h</div></div>
            <div className="stat-card"><div className="stat-icon">🌧️</div><div className="stat-label">{t('precipitation', 'Rain')}</div><div className="stat-value">{weather.rainProbability}%</div></div>
            <div className="stat-card"><div className="stat-icon">☀️</div><div className="stat-label">{t('uvIndex', 'UV Index')}</div><div className="stat-value">{weather.uvIndex}</div></div>
            <div className="stat-card"><div className="stat-icon">🏭</div><div className="stat-label">{t('airQuality', 'AQI')}</div><div className="stat-value">{weather.airQuality || 'Optimal (42 AQI)'}</div></div>
            <div className="stat-card"><div className="stat-icon">🌅</div><div className="stat-label">{t('sunrise', 'Sunrise')}</div><div className="stat-value">{weather.sunrise || '06:12 AM'}</div></div>
            <div className="stat-card"><div className="stat-icon">🌇</div><div className="stat-label">{t('sunset', 'Sunset')}</div><div className="stat-value">{weather.sunset || '06:45 PM'}</div></div>
            <div className="stat-card"><div className="stat-icon">👁️</div><div className="stat-label">{t('visibility', 'Visibility')}</div><div className="stat-value">{weather.visibility || '10'} km</div></div>
            <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-label">{t('pressure', 'Pressure')}</div><div className="stat-value">{weather.pressure || '1013'} hPa</div></div>
            <div className="stat-card"><div className="stat-icon">🌱</div><div className="stat-label">{t('soilMoisture', 'Soil Moisture')}</div><div className="stat-value">{weather.soilMoistureSuggestion || '65'}%</div></div>
            <div className="stat-card"><div className="stat-icon">⚠️</div><div className="stat-label">{t('healthStatus', 'Crop Stress')}</div><div className="stat-value">{weather.temperature > 35 ? t('critical', 'High') : weather.temperature > 32 ? t('needsCare', 'Moderate') : t('healthy', 'Low')}</div></div>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="alerts-section">
              {alerts.map((alert, idx) => (
                <div key={idx} className={`alert-item ${alert.type}`}>
                  <span>{alert.type === 'danger' ? '⚠️' : alert.type === 'warning' ? '⚡' : 'ℹ️'}</span>
                  <span>{alert.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Smart Recommendations */}
        <div className="recommendations-card-premium">
          <div className="section-title-premium">
            🤖 {t('aiAdvisor', 'AI-Powered Smart Recommendations')}
            <span className="ai-badge">{t('live', 'LIVE')}</span>
          </div>
          <div className="rec-list">
            {recommendations.map((rec, idx) => (
              <div key={idx} className={`rec-item priority-${rec.priority}`}>
                <div className="rec-icon">{rec.icon}</div>
                <div className="rec-content">
                  <h4>{rec.title}</h4>
                  <p>{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid-premium">
        <div className="chart-card-premium">
          <div className="chart-title-premium">📈 {t('sevenDayOutlook', '7-Day Temperature Trend')}</div>
          <div className="chart-container-premium">
            <Line data={tempTrendData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card-premium">
          <div className="chart-title-premium">🌧️ {t('precipitation', 'Rain Probability Forecast')}</div>
          <div className="chart-container-premium">
            <Bar data={rainForecastData} options={rainChartOptions} />
          </div>
        </div>
        <div className="chart-card-premium">
          <div className="chart-title-premium">⏱️ {t('hourlyRadarTag', 'Hourly Temperature')}</div>
          <div className="chart-container-premium">
            <Line data={hourlyTempData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card-premium">
          <div className="chart-title-premium">💨 {t('humidity', 'Humidity')} vs {t('wind', 'Wind Speed')}</div>
          <div className="chart-container-premium">
            <Bar data={humidityWindData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast Summary */}
      <div className="forecast-24h">
        <div className="chart-title-premium">⏰ {t('today', 'Next 24 Hours Forecast')}</div>
        <div className="hourly-scroll">
          {hourlySummary.map((hour, idx) => (
            <div key={idx} className="hour-card">
              <div className="hour-time">{hour.time}</div>
              <div className="hour-icon">{hour.icon}</div>
              <div className="hour-temp">{hour.temp}°</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;