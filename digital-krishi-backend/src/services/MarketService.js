const axios = require("axios");

const AGMARKNET_API = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

const CROP_MAPPING = {
  "Wheat": "Wheat", "Rice": "Rice", "Maize": "Maize", "Bajra": "Bajra", "Jowar": "Jowar",
  "Chana": "Gram", "Tur": "Tur(Arhar)", "Moong": "Moong(Green Gram)", "Urad": "Urad", "Masoor": "Masoor",
  "Onion": "Onion", "Tomato": "Tomato", "Potato": "Potato", "Brinjal": "Brinjal", 
  "Cabbage": "Cabbage", "Cauliflower": "Cauliflower", "Green Chilli": "Green Chilli",
  "Banana": "Banana", "Mango": "Mango", "Grapes": "Grapes", "Pomegranate": "Pomegranate",
  "Cotton": "Cotton", "Sugarcane": "Sugarcane", "Soybean": "Soyabean", "Groundnut": "Groundnut", "Sunflower": "Sunflower"
};

const COMMODITY_ALTERNATES = {
  "Banana": ["Banana", "Banana - Green", "Banana - Ripe", "Banana(Robusta)", "Banana - Local"],
  "Onion": ["Onion", "Onion - Nasik", "Onion - Bangalore"],
  "Tomato": ["Tomato", "Tomato - Desi", "Tomato - Hybrid"],
  "Potato": ["Potato", "Potato - Red", "Potato - Local"],
  "Rice": ["Rice", "Paddy(Dhan)(Common)", "Paddy(Dhan)(Basmati)"]
};

const RELIABLE_CROPS = ["Onion", "Tomato", "Potato", "Wheat", "Rice", "Cotton", "Soybean", "Sugarcane"];

const callAgmarknetAPI = async (filters, limit = 100) => {
  try {
    const apiKey = process.env.MARKET_API_KEY;
    let url = `${AGMARKNET_API}?api-key=${apiKey}&format=json&limit=${limit}`;
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) url += `&filters[${key}]=${encodeURIComponent(filters[key])}`;
    });
    
    console.log("🔗 AGMARKNET API Call:", url.substring(0, 150) + "...");
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data && response.data.records) {
      console.log(`✅ Fetched ${response.data.records.length} records from AGMARKNET`);
      return response.data.records;
    }
    return [];
  } catch (error) {
    console.error("❌ AGMARKNET API Error:", error.message);
    return [];
  }
};

const smartFallbackSearch = async (commodity, state, district, market) => {
  const mappedCommodity = CROP_MAPPING[commodity] || commodity;
  const alternates = COMMODITY_ALTERNATES[commodity] || [mappedCommodity];
  
  for (const altCommodity of alternates) {
    console.log(`🔍 Trying: ${altCommodity}`);
    
    if (market) {
      const records = await callAgmarknetAPI({ commodity: altCommodity, state, district, market }, 10);
      if (records.length > 0) return { records, searchLevel: "market", usedCommodity: altCommodity };
    }
    
    if (district) {
      const records = await callAgmarknetAPI({ commodity: altCommodity, state, district }, 10);
      if (records.length > 0) return { records, searchLevel: "district", usedCommodity: altCommodity };
    }
    
    if (state) {
      const records = await callAgmarknetAPI({ commodity: altCommodity, state }, 10);
      if (records.length > 0) return { records, searchLevel: "state", usedCommodity: altCommodity };
    }
    
    const records = await callAgmarknetAPI({ commodity: altCommodity }, 10);
    if (records.length > 0) return { records, searchLevel: "national", usedCommodity: altCommodity };
  }
  
  return null;
};

const getCurrentMarketPrice = async ({ commodity, state, district, market }) => {
  try {
    const result = await smartFallbackSearch(commodity, state, district, market);
    
    if (!result || result.records.length === 0) {
      throw new Error(`No data available for ${commodity}. Try: ${RELIABLE_CROPS.join(", ")}`);
    }
    
    console.log(`✅ Found data at ${result.searchLevel} level using ${result.usedCommodity}`);
    
    const latest = result.records[0];
    return {
      commodity: latest.commodity,
      state: latest.state,
      district: latest.district,
      market: latest.market,
      variety: latest.variety || "Common",
      grade: latest.grade || "FAQ",
      modalPrice: parseFloat(latest.modal_price),
      minPrice: parseFloat(latest.min_price),
      maxPrice: parseFloat(latest.max_price),
      arrivalQuantity: parseFloat(latest.arrival_date) || 0,
      unit: "Quintal",
      marketStatus: "Open",
      lastTradeDate: latest.arrival_date,
      source: `AGMARKNET_${result.searchLevel.toUpperCase()}`,
      fallbackUsed: result.searchLevel !== "market"
    };
  } catch (error) {
    console.error("getCurrentMarketPrice error:", error.message);
    throw error;
  }
};

const getPriceHistory = async ({ commodity, state, district, days }) => {
  try {
    const result = await smartFallbackSearch(commodity, state, district, null);
    
    if (!result || result.records.length === 0) {
      throw new Error(`No historical data for ${commodity}. Try: ${RELIABLE_CROPS.join(", ")}`);
    }
    
    const records = result.records;
    
    const uniqueDates = {};
    records.forEach(r => {
      const date = r.arrival_date;
      if (date && !uniqueDates[date] && r.modal_price) {
        uniqueDates[date] = {
          date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          price: parseFloat(r.modal_price),
          minPrice: parseFloat(r.min_price),
          maxPrice: parseFloat(r.max_price)
        };
      }
    });
    
    const history = Object.values(uniqueDates).slice(0, days).reverse();
    
    if (history.length === 0) {
      throw new Error(`Insufficient historical data for ${commodity}`);
    }
    
    return history;
  } catch (error) {
    console.error("getPriceHistory error:", error.message);
    throw error;
  }
};



const getArrivalData = async ({ commodity, state, district, days }) => {
  try {
    const result = await smartFallbackSearch(commodity, state, district, null);
    
    if (!result || result.records.length === 0) {
      throw new Error(`No arrival data for ${commodity}. Try: ${RELIABLE_CROPS.join(", ")}`);
    }
    
    const records = result.records;
    
    const arrivals = records.slice(0, days)
      .filter(r => r.arrival_date)
      .map(r => ({
        date: new Date(r.arrival_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        quantity: parseFloat(r.arrivals_in_qtl) || 0
      }))
      .reverse();
    
    if (arrivals.length === 0) {
      throw new Error(`No valid arrival records for ${commodity}`);
    }
    
    return arrivals;
  } catch (error) {
    console.error("getArrivalData error:", error.message);
    throw error;
  }
};



const getMultiMarketPrices = async ({ commodity, state, markets }) => {
  try {
    const searchResult = await smartFallbackSearch(commodity, state, null, null);
    
    if (!searchResult || searchResult.records.length === 0) {
      throw new Error(`No multi-market data for ${commodity}. Try: ${RELIABLE_CROPS.join(", ")}`);
    }
    
    const records = searchResult.records;
    
    const marketPrices = {};
    
    records.forEach(r => {
      const marketName = r.market;
      if (marketName && r.modal_price && !marketPrices[marketName]) {
        marketPrices[marketName] = {
          name: marketName,
          price: parseFloat(r.modal_price),
          district: r.district,
          trend: 'stable'
        };
      }
    });
    
    const marketList = Object.values(marketPrices).slice(0, 5);
    
    if (marketList.length === 0) {
      throw new Error(`No valid market price data for ${commodity}`);
    }
    
    return marketList;
  } catch (error) {
    console.error("getMultiMarketPrices error:", error.message);
    throw error;
  }
};



const getStatesAndDistricts = async () => {
  try {
    const records = await callAgmarknetAPI({}, 500);
    
    if (!records || records.length === 0) {
      throw new Error('Unable to fetch location data from AGMARKNET API');
    }
    
    const states = [...new Set(records.map(r => r.state).filter(Boolean))];
    const districts = [...new Set(records.map(r => r.district).filter(Boolean))];
    const markets = [...new Set(records.map(r => r.market).filter(Boolean))];
    const commodities = [...new Set(records.map(r => r.commodity).filter(Boolean))];
    
    return { states, districts, markets, commodities };
  } catch (error) {
    console.error("getStatesAndDistricts error:", error.message);
    throw error;
  }
};

const getSummary = async () => {
  try {
    const records = await callAgmarknetAPI({}, 100);
    
    if (!records || records.length === 0) {
      throw new Error('Unable to fetch market summary from AGMARKNET API');
    }
    
    const commodityPrices = {};
    records.forEach(r => {
      if (r.commodity && r.modal_price) {
        if (!commodityPrices[r.commodity]) {
          commodityPrices[r.commodity] = [];
        }
        commodityPrices[r.commodity].push(parseFloat(r.modal_price));
      }
    });
    
    const topCrops = Object.entries(commodityPrices)
      .map(([name, prices]) => {
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        return {
          name,
          price: `₹${Math.round(avgPrice).toLocaleString()}`,
          avgPrice: Math.round(avgPrice)
        };
      })
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 10);
    
    return { topCrops };
  } catch (error) {
    console.error("getSummary error:", error.message);
    throw error;
  }
};

const getChatbotResponse = async ({ message, commodity, state, district, market }) => {
  try {
    const lowerMessage = message.toLowerCase();
    
    if (!commodity) {
      return {
        reply: "Please select a crop from the filters to get personalized market advice.",
        timestamp: new Date().toISOString()
      };
    }

    const searchResult = await smartFallbackSearch(commodity, state, district, market);
    
    if (!searchResult || searchResult.records.length === 0) {
      return {
        reply: `I couldn't find current market data for ${commodity}. Try selecting crops like Onion, Tomato, Potato, or Wheat which have more reliable data availability.`,
        timestamp: new Date().toISOString()
      };
    }

    const currentData = searchResult.records[0];
    const currentPrice = parseFloat(currentData.modal_price);
    const minPrice = parseFloat(currentData.min_price);
    const maxPrice = parseFloat(currentData.max_price);
    const marketName = currentData.market || market || district;
    
    const allRecords = searchResult.records;
    let weeklyChange = 0;
    if (allRecords.length > 1) {
      const oldPrice = parseFloat(allRecords[allRecords.length - 1].modal_price);
      weeklyChange = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0;
    }

    const pricePosition = maxPrice > minPrice ? ((currentPrice - minPrice) / (maxPrice - minPrice)) * 100 : 50;

    if (lowerMessage.includes('sell') || lowerMessage.includes('should i') || lowerMessage.includes('today')) {
      if (pricePosition >= 75 || weeklyChange > 3) {
        return {
          reply: `Yes, I recommend selling ${commodity} today. Current price is ₹${currentPrice.toLocaleString()}/quintal in ${marketName}, which is ${pricePosition.toFixed(0)}% near the maximum range${weeklyChange > 0 ? ` and ${weeklyChange.toFixed(1)}% higher than recent prices` : ''}. This is a good selling opportunity.`,
          timestamp: new Date().toISOString(),
          confidence: 'high'
        };
      } else if (weeklyChange < -3) {
        return {
          reply: `Current ${commodity} prices are ₹${currentPrice.toLocaleString()}/quintal in ${marketName}. Prices have dropped ${Math.abs(weeklyChange).toFixed(1)}% recently. I recommend selling soon before further decline, or if you have storage, wait 1-2 weeks for recovery.`,
          timestamp: new Date().toISOString(),
          confidence: 'medium'
        };
      } else {
        return {
          reply: `${commodity} is trading at ₹${currentPrice.toLocaleString()}/quintal in ${marketName}. Market is relatively stable. You can sell now at fair rates, or monitor for 2-3 days if you expect price improvement.`,
          timestamp: new Date().toISOString(),
          confidence: 'medium'
        };
      }
    }

    if (lowerMessage.includes('price') || lowerMessage.includes('rate') || lowerMessage.includes('cost')) {
      return {
        reply: `Current ${commodity} prices in ${marketName}: Modal Price: ₹${currentPrice.toLocaleString()}/quintal, Min: ₹${minPrice.toLocaleString()}, Max: ₹${maxPrice.toLocaleString()}. ${weeklyChange > 0 ? `Prices are up ${weeklyChange.toFixed(1)}% recently.` : weeklyChange < 0 ? `Prices are down ${Math.abs(weeklyChange).toFixed(1)}% recently.` : 'Prices are stable.'}`,
        timestamp: new Date().toISOString(),
        confidence: 'high'
      };
    }

    if (lowerMessage.includes('market') || lowerMessage.includes('where') || lowerMessage.includes('which')) {
      const marketPrices = {};
      allRecords.forEach(r => {
        const mkt = r.market;
        if (mkt && r.modal_price && !marketPrices[mkt]) {
          marketPrices[mkt] = parseFloat(r.modal_price);
        }
      });
      
      const sortedMarkets = Object.entries(marketPrices)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
      
      if (sortedMarkets.length > 1) {
        const topMarket = sortedMarkets[0];
        return {
          reply: `For ${commodity}, ${topMarket[0]} offers the best price at ₹${topMarket[1].toLocaleString()}/quintal. Other good options: ${sortedMarkets.slice(1).map(m => `${m[0]} (₹${m[1].toLocaleString()})`).join(', ')}. Consider transportation costs when choosing.`,
          timestamp: new Date().toISOString(),
          confidence: 'high'
        };
      }
    }

    if (lowerMessage.includes('wait') || lowerMessage.includes('hold') || lowerMessage.includes('later')) {
      if (weeklyChange > 2) {
        return {
          reply: `${commodity} prices are rising (${weeklyChange.toFixed(1)}% increase). If you can wait 3-5 days and have proper storage, prices may improve further. Current: ₹${currentPrice.toLocaleString()}/quintal.`,
          timestamp: new Date().toISOString(),
          confidence: 'medium'
        };
      } else {
        return {
          reply: `Based on current ${commodity} market trends, I don't see strong indicators for significant price increase. Current price ₹${currentPrice.toLocaleString()}/quintal is fair. Recommend selling now rather than waiting.`,
          timestamp: new Date().toISOString(),
          confidence: 'medium'
        };
      }
    }

    if (lowerMessage.includes('rise') || lowerMessage.includes('increase') || lowerMessage.includes('up')) {
      if (weeklyChange > 2) {
        return {
          reply: `Yes, ${commodity} prices are showing upward trend with ${weeklyChange.toFixed(1)}% increase. Current momentum suggests potential for further rise. Monitor daily and sell when you're satisfied with the rate.`,
          timestamp: new Date().toISOString(),
          confidence: 'medium'
        };
      } else {
        return {
          reply: `${commodity} prices are currently stable at ₹${currentPrice.toLocaleString()}/quintal. No strong upward trend detected. Price rise depends on demand, supply, and seasonal factors.`,
          timestamp: new Date().toISOString(),
          confidence: 'medium'
        };
      }
    }

    return {
      reply: `Based on live AGMARKNET data, ${commodity} is trading at ₹${currentPrice.toLocaleString()}/quintal in ${marketName}. ${weeklyChange > 3 ? 'Prices are rising - good time to sell.' : weeklyChange < -3 ? 'Prices are falling - sell soon or wait for recovery.' : 'Market is stable - you can sell at current rates.'} Ask me specific questions like "Should I sell today?" or "Which market is best?" for detailed advice.`,
      timestamp: new Date().toISOString(),
      confidence: 'medium'
    };

  } catch (error) {
    console.error("getChatbotResponse error:", error.message);
    return {
      reply: "I'm having trouble analyzing market data right now. Please try again in a moment or check your internet connection.",
      timestamp: new Date().toISOString(),
      confidence: 'low'
    };
  }
};

module.exports = {
  getCurrentMarketPrice,
  getPriceHistory,
  getArrivalData,
  getMultiMarketPrices,
  getStatesAndDistricts,
  getSummary,
  getChatbotResponse
};
