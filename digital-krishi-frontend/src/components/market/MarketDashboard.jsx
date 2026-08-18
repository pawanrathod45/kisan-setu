import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import './MarketDashboard.css';

const MarketDashboard = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('wheat');

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = () => {
    setTimeout(() => {
      setMarketData(generateMockData());
      setLoading(false);
    }, 800);
  };

  const generateMockData = () => ({
    trending: [
      { name: 'Wheat', price: 2450, change: 5.2, volume: 1250, icon: '🌾', trend: 'up' },
      { name: 'Rice', price: 3200, change: -2.1, volume: 980, icon: '🍚', trend: 'down' },
      { name: 'Cotton', price: 5800, change: 8.5, volume: 650, icon: '🌱', trend: 'up' },
      { name: 'Sugarcane', price: 3100, change: 3.2, volume: 1100, icon: '🎋', trend: 'up' }
    ],
    priceHistory: [
      { time: '9 AM', wheat: 2380, rice: 3250, cotton: 5600 },
      { time: '10 AM', wheat: 2400, rice: 3230, cotton: 5650 },
      { time: '11 AM', wheat: 2420, rice: 3210, cotton: 5700 },
      { time: '12 PM', wheat: 2435, rice: 3200, cotton: 5750 },
      { time: '1 PM', wheat: 2450, rice: 3200, cotton: 5800 }
    ],
    demandSupply: [
      { crop: 'Wheat', demand: 85, supply: 70 },
      { crop: 'Rice', demand: 75, supply: 80 },
      { crop: 'Cotton', demand: 90, supply: 65 },
      { crop: 'Corn', demand: 70, supply: 75 }
    ],
    insights: [
      { title: 'High Demand Alert', desc: 'Cotton prices up 8.5% due to export demand', priority: 'high', icon: '📈' },
      { title: 'Best Selling Time', desc: 'Wheat prices optimal for next 48 hours', priority: 'medium', icon: '⏰' },
      { title: 'Market Opportunity', desc: 'Rice oversupply - consider storage', priority: 'low', icon: '💡' }
    ],
    stats: {
      avgPrice: 3638,
      totalVolume: 3980,
      activeMarkets: 24,
      topGainer: 'Cotton +8.5%'
    }
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner-premium"></div>
        <p>Loading Market Data...</p>
      </div>
    );
  }

  return (
    <div className="market-dashboard">
      <div className="dashboard-header-premium">
        <div className="header-left">
          <h1>📊 Market Dashboard</h1>
          <div className="badges">
            <span className="live-badge">🔴 LIVE</span>
            <span className="location-badge">📍 All India Markets</span>
          </div>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={fetchMarketData}>🔄 Refresh</button>
          <span className="last-update">Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="stats-overview">
        <div className="stat-box">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-label">Avg Price</span>
            <span className="stat-value">₹{marketData.stats.avgPrice}</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <span className="stat-label">Total Volume</span>
            <span className="stat-value">{marketData.stats.totalVolume} MT</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <span className="stat-label">Active Markets</span>
            <span className="stat-value">{marketData.stats.activeMarkets}</span>
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-icon">🚀</div>
          <div className="stat-info">
            <span className="stat-label">Top Gainer</span>
            <span className="stat-value">{marketData.stats.topGainer}</span>
          </div>
        </div>
      </div>

      <div className="main-grid-premium">
        <div className="left-section">
          <div className="trending-crops-card">
            <h2 className="section-title-premium">🔥 Trending Crops</h2>
            <div className="trending-list">
              {marketData.trending.map((crop, idx) => (
                <div key={idx} className={`crop-item ${crop.trend}`}>
                  <div className="crop-icon">{crop.icon}</div>
                  <div className="crop-info">
                    <h3>{crop.name}</h3>
                    <p className="volume">{crop.volume} MT traded</p>
                  </div>
                  <div className="crop-price">
                    <span className="price">₹{crop.price}</span>
                    <span className={`change ${crop.trend}`}>
                      {crop.trend === 'up' ? '↑' : '↓'} {Math.abs(crop.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card-premium">
            <h2 className="chart-title-premium">📈 Price Trends (Today)</h2>
            <div className="chart-container-premium">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketData.priceHistory}>
                  <defs>
                    <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCotton" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF9800" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF9800" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="wheat" stroke="#4CAF50" fillOpacity={1} fill="url(#colorWheat)" />
                  <Area type="monotone" dataKey="rice" stroke="#2196F3" fillOpacity={1} fill="url(#colorRice)" />
                  <Area type="monotone" dataKey="cotton" stroke="#FF9800" fillOpacity={1} fill="url(#colorCotton)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card-premium">
            <h2 className="chart-title-premium">⚖️ Demand vs Supply</h2>
            <div className="chart-container-premium">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketData.demandSupply}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="crop" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="demand" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="supply" fill="#2196F3" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="right-section">
          <div className="insights-card">
            <h2 className="section-title-premium">
              💡 Market Insights
              <span className="ai-badge">AI</span>
            </h2>
            <div className="insights-list">
              {marketData.insights.map((insight, idx) => (
                <div key={idx} className={`insight-item priority-${insight.priority}`}>
                  <div className="insight-icon">{insight.icon}</div>
                  <div className="insight-content">
                    <h4>{insight.title}</h4>
                    <p>{insight.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="quick-actions-card">
            <h2 className="section-title-premium">⚡ Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn primary">
                <span className="action-icon">💰</span>
                <span>Sell Produce</span>
              </button>
              <button className="action-btn secondary">
                <span className="action-icon">📊</span>
                <span>View Reports</span>
              </button>
              <button className="action-btn tertiary">
                <span className="action-icon">🔔</span>
                <span>Set Alerts</span>
              </button>
              <button className="action-btn quaternary">
                <span className="action-icon">📍</span>
                <span>Find Markets</span>
              </button>
            </div>
          </div>

          <div className="news-card">
            <h2 className="section-title-premium">📰 Market News</h2>
            <div className="news-list">
              <div className="news-item">
                <span className="news-time">2h ago</span>
                <p>Government announces MSP increase for wheat by 5%</p>
              </div>
              <div className="news-item">
                <span className="news-time">4h ago</span>
                <p>Export demand for cotton reaches all-time high</p>
              </div>
              <div className="news-item">
                <span className="news-time">6h ago</span>
                <p>Monsoon forecast positive for rice cultivation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
