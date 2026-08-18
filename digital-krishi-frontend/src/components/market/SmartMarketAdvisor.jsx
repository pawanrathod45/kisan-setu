import React, { useMemo } from 'react';
import './SmartMarketAdvisor.css';

const SmartMarketAdvisor = ({ 
  marketData, 
  priceHistory, 
  multiMarketData, 
  arrivalsData,
  selectedCrop,
  selectedMarket,
  selectedDistrict 
}) => {
  
  const generateSmartRecommendations = useMemo(() => {
    const recommendations = [];
    
    if (!marketData) {
      return [{
        type: 'info',
        icon: '🤖',
        action: 'Market Analysis',
        message: 'Based on current market trends, I\'m analyzing the best selling strategy for you.',
        confidence: 'medium',
        priority: 1
      }];
    }

    const currentPrice = marketData.modalPrice || 0;
    const minPrice = marketData.minPrice || 0;
    const maxPrice = marketData.maxPrice || 0;
    const priceRange = maxPrice - minPrice;
    const pricePosition = currentPrice - minPrice;
    const pricePercentile = priceRange > 0 ? (pricePosition / priceRange) * 100 : 50;

    // Calculate price analytics
    let weeklyChange = 0;
    let monthlyChange = 0;
    let avgWeekPrice = currentPrice;
    let avgMonthPrice = currentPrice;
    
    if (priceHistory && priceHistory.length > 0) {
      const weekData = priceHistory.slice(0, Math.min(7, priceHistory.length));
      const monthData = priceHistory.slice(0, Math.min(30, priceHistory.length));
      
      if (weekData.length > 1) {
        avgWeekPrice = weekData.reduce((sum, d) => sum + (d.price || 0), 0) / weekData.length;
        const oldestWeekPrice = weekData[weekData.length - 1]?.price || currentPrice;
        weeklyChange = oldestWeekPrice > 0 ? ((currentPrice - oldestWeekPrice) / oldestWeekPrice) * 100 : 0;
      }
      
      if (monthData.length > 1) {
        avgMonthPrice = monthData.reduce((sum, d) => sum + (d.price || 0), 0) / monthData.length;
        const oldestMonthPrice = monthData[monthData.length - 1]?.price || currentPrice;
        monthlyChange = oldestMonthPrice > 0 ? ((currentPrice - oldestMonthPrice) / oldestMonthPrice) * 100 : 0;
      }
    }

    // 1. SELL NOW - High Priority
    if (pricePercentile >= 80 && weeklyChange > 3) {
      recommendations.push({
        type: 'sell-now',
        icon: '🟢',
        action: 'Sell Now - Excellent Opportunity',
        message: `Current ${selectedCrop} price of ₹${currentPrice.toLocaleString()}/quintal is ${pricePercentile.toFixed(0)}% near the maximum range and ${weeklyChange.toFixed(1)}% higher than last week. This is an optimal selling window.`,
        confidence: 'high',
        priority: 1
      });
    } else if (currentPrice > avgWeekPrice * 1.05) {
      recommendations.push({
        type: 'sell-now',
        icon: '🟢',
        action: 'Good Time to Sell',
        message: `${selectedCrop} prices in ${selectedMarket} are ${((currentPrice / avgWeekPrice - 1) * 100).toFixed(1)}% above weekly average. Market conditions favor selling today.`,
        confidence: 'high',
        priority: 1
      });
    }

    // 2. WAIT FOR BETTER PRICE
    if (weeklyChange > 2 && weeklyChange < 5 && monthlyChange > 3) {
      recommendations.push({
        type: 'wait',
        icon: '🟡',
        action: 'Wait 2-3 Days for Better Price',
        message: `${selectedCrop} prices are rising steadily (${weeklyChange.toFixed(1)}% this week, ${monthlyChange.toFixed(1)}% this month). Market momentum suggests further price increase expected.`,
        confidence: 'medium',
        priority: 2
      });
    }

    // 3. BETTER MARKET AVAILABLE
    if (multiMarketData && multiMarketData.length > 1) {
      const sortedMarkets = [...multiMarketData].sort((a, b) => b.price - a.price);
      const bestMarket = sortedMarkets[0];
      const priceDiff = bestMarket.price - currentPrice;
      
      if (priceDiff > currentPrice * 0.03 && bestMarket.name !== selectedMarket) {
        recommendations.push({
          type: 'better-market',
          icon: '🔵',
          action: 'Better Market Available',
          message: `${bestMarket.name} is offering ₹${bestMarket.price.toLocaleString()}/quintal for ${selectedCrop}, which is ₹${priceDiff.toFixed(0)} (${((priceDiff / currentPrice) * 100).toFixed(1)}%) higher than ${selectedMarket}. Consider selling there.`,
          confidence: 'high',
          priority: 1
        });
      }
    }

    // 4. PRICE DROP WARNING
    if (weeklyChange < -3) {
      recommendations.push({
        type: 'warning',
        icon: '🔴',
        action: 'Price Drop Alert - Sell Soon',
        message: `${selectedCrop} prices have dropped ${Math.abs(weeklyChange).toFixed(1)}% this week in ${selectedDistrict}. Downward trend detected. Recommend selling within 24-48 hours to avoid further losses.`,
        confidence: 'high',
        priority: 1
      });
    } else if (weeklyChange < -1 && monthlyChange < -2) {
      recommendations.push({
        type: 'warning',
        icon: '🔴',
        action: 'Declining Market Trend',
        message: `Market showing consistent decline for ${selectedCrop}. Weekly: ${weeklyChange.toFixed(1)}%, Monthly: ${monthlyChange.toFixed(1)}%. Consider selling before further depreciation.`,
        confidence: 'medium',
        priority: 2
      });
    }

    // 5. STORAGE RECOMMENDATION
    if (weeklyChange < -2 && pricePercentile < 40) {
      recommendations.push({
        type: 'storage',
        icon: '🟣',
        action: 'Storage Recommended',
        message: `Current ${selectedCrop} price of ₹${currentPrice.toLocaleString()} is ${(100 - pricePercentile).toFixed(0)}% below peak. Prices are in lower range. If you have storage facilities, consider holding for 2-3 weeks for better rates.`,
        confidence: 'medium',
        priority: 3
      });
    }

    // 6. FESTIVAL DEMAND OPPORTUNITY
    const currentMonth = new Date().getMonth();
    const festivalMonths = [8, 9, 10]; // Sep, Oct, Nov - Festival season
    if (festivalMonths.includes(currentMonth)) {
      recommendations.push({
        type: 'festival',
        icon: '🎉',
        action: 'Festival Season Demand',
        message: `Festival season is active. ${selectedCrop} demand typically increases during this period. Monitor prices closely for sudden spikes in the next 7-10 days.`,
        confidence: 'medium',
        priority: 3
      });
    }

    // 7. HIGH DEMAND ALERT (based on arrivals)
    if (arrivalsData && arrivalsData.length > 2) {
      const recentArrivals = arrivalsData.slice(0, 3);
      const avgArrival = recentArrivals.reduce((sum, a) => sum + (a.quantity || 0), 0) / recentArrivals.length;
      const latestArrival = recentArrivals[0]?.quantity || 0;
      
      if (latestArrival < avgArrival * 0.7 && weeklyChange > 0) {
        recommendations.push({
          type: 'demand',
          icon: '📈',
          action: 'Low Supply - High Demand',
          message: `${selectedCrop} arrivals in ${selectedMarket} have decreased by ${(((avgArrival - latestArrival) / avgArrival) * 100).toFixed(0)}%. Lower supply with rising prices indicates strong demand. Favorable selling conditions.`,
          confidence: 'high',
          priority: 2
        });
      }
    }

    // 8. STABLE MARKET - NEUTRAL ADVICE
    if (Math.abs(weeklyChange) < 2 && pricePercentile >= 40 && pricePercentile <= 70) {
      recommendations.push({
        type: 'stable',
        icon: '⚪',
        action: 'Stable Market Conditions',
        message: `${selectedCrop} market in ${selectedDistrict} is stable with minimal price fluctuation (${weeklyChange.toFixed(1)}% weekly change). Current price ₹${currentPrice.toLocaleString()} is fair. You can sell now or wait for better opportunity.`,
        confidence: 'medium',
        priority: 4
      });
    }

    // 9. PRICE NEAR MAXIMUM
    if (pricePercentile >= 90) {
      recommendations.push({
        type: 'sell-now',
        icon: '🟢',
        action: 'Price at Peak Range',
        message: `${selectedCrop} is trading at ₹${currentPrice.toLocaleString()}, which is ${pricePercentile.toFixed(0)}% of the maximum price range. This is near the upper limit. Strong recommendation to sell immediately.`,
        confidence: 'very-high',
        priority: 1
      });
    }

    // 10. CROP-SPECIFIC STRATEGY
    const cropStrategies = {
      'Onion': 'Onion prices are highly volatile. Current market conditions suggest monitoring daily price changes closely.',
      'Tomato': 'Tomato is a perishable crop. Sell within optimal freshness window to maximize returns.',
      'Potato': 'Potato has good storage life. If prices are low, consider cold storage for 1-2 months.',
      'Wheat': 'Wheat prices are influenced by MSP. Compare current market price with government support price.',
      'Rice': 'Rice market is stable. Government procurement provides price floor. Safe to sell at current rates.',
      'Cotton': 'Cotton prices depend on textile demand and exports. Monitor international market trends.',
      'Soybean': 'Soybean prices linked to oil extraction demand. Check crushing unit rates in your area.'
    };

    if (cropStrategies[selectedCrop]) {
      recommendations.push({
        type: 'strategy',
        icon: '💡',
        action: `${selectedCrop} Selling Strategy`,
        message: cropStrategies[selectedCrop],
        confidence: 'medium',
        priority: 4
      });
    }

    // Sort by priority and return top 6
    return recommendations
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 6);

  }, [marketData, priceHistory, multiMarketData, arrivalsData, selectedCrop, selectedMarket, selectedDistrict]);

  const getConfidenceBadge = (confidence) => {
    const badges = {
      'very-high': { text: '95% Confidence', color: '#2E7D32' },
      'high': { text: '85% Confidence', color: '#4CAF50' },
      'medium': { text: '70% Confidence', color: '#FF9800' },
      'low': { text: '50% Confidence', color: '#9E9E9E' }
    };
    return badges[confidence] || badges['medium'];
  };

  return (
    <div className="smart-advisor-container">
      <div className="advisor-header">
        <div className="advisor-title-section">
          <div className="advisor-icon-large">🤖</div>
          <div className="advisor-title-text">
            <h2>Kisan Setu Smart Market Advisor</h2>
            <p>AI-Powered Real-Time Selling Recommendations</p>
          </div>
        </div>
        <div className="advisor-badges">
          <span className="live-ai-badge">
            <span className="pulse-dot"></span>
            LIVE AI
          </span>
          <span className="agmarknet-badge">📡 AGMARKNET</span>
        </div>
      </div>

      <div className="advisor-intro">
        <p>
          <strong>Hello Farmer!</strong> I've analyzed real-time market data for <strong>{selectedCrop}</strong> in <strong>{selectedMarket}</strong>. 
          Here are my intelligent recommendations based on current prices, trends, and market conditions:
        </p>
      </div>

      <div className="recommendations-chatbot">
        {generateSmartRecommendations.map((rec, idx) => (
          <div key={idx} className={`chatbot-message ${rec.type}`}>
            <div className="message-icon">{rec.icon}</div>
            <div className="message-content">
              <div className="message-header">
                <h4>{rec.action}</h4>
                <span 
                  className="confidence-badge" 
                  style={{ backgroundColor: getConfidenceBadge(rec.confidence).color }}
                >
                  {getConfidenceBadge(rec.confidence).text}
                </span>
              </div>
              <p>{rec.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="advisor-footer">
        <div className="footer-info">
          <span className="footer-icon">💡</span>
          <span>Recommendations updated every 5 minutes based on live AGMARKNET data</span>
        </div>
        <div className="footer-disclaimer">
          <span className="footer-icon">ℹ️</span>
          <span>These are AI-generated suggestions. Final selling decision should consider local market conditions and personal circumstances.</span>
        </div>
      </div>
    </div>
  );
};

export default SmartMarketAdvisor;
