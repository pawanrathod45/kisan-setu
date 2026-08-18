import API from './api';

const marketService = {
  getCurrentMarketPrice: async ({ commodity, state, district, market }) => {
    try {
      console.log(`📊 Fetching current market price for ${commodity}...`);
      const response = await API.get('/market/current', {
        params: { commodity, state, district, market }
      });
      
      if (response.data) {
        console.log('✅ Real AGMARKNET data received:', response.data);
        return response.data;
      }
      
      throw new Error('No data received from API');
    } catch (error) {
      console.error('❌ Market price fetch error:', error);
      throw error;
    }
  },

  getPriceHistory: async ({ commodity, state, district, days }) => {
    try {
      console.log(`📈 Fetching ${days}-day price history for ${commodity}...`);
      const response = await API.get('/market/history', {
        params: { commodity, state, district, days }
      });
      
      if (response.data && response.data.length > 0) {
        console.log(`✅ Received ${response.data.length} historical records`);
        return response.data;
      }
      
      throw new Error('No history data received');
    } catch (error) {
      console.error('❌ Price history fetch error:', error);
      throw error;
    }
  },

  getArrivalData: async ({ commodity, state, district, days }) => {
    try {
      console.log(`🚚 Fetching arrival data for ${commodity}...`);
      const response = await API.get('/market/arrivals', {
        params: { commodity, state, district, days }
      });
      
      if (response.data && response.data.length > 0) {
        console.log(`✅ Received ${response.data.length} arrival records`);
        return response.data;
      }
      
      throw new Error('No arrival data received');
    } catch (error) {
      console.error('❌ Arrival data fetch error:', error);
      throw error;
    }
  },

  getMultiMarketPrices: async ({ commodity, state, markets }) => {
    try {
      console.log(`🏪 Fetching multi-market prices for ${commodity}...`);
      const response = await API.get('/market/multi-market', {
        params: { commodity, state, markets: markets.join(',') }
      });
      
      if (response.data && response.data.length > 0) {
        console.log(`✅ Received ${response.data.length} market comparisons`);
        return response.data;
      }
      
      throw new Error('No multi-market data received');
    } catch (error) {
      console.error('❌ Multi-market fetch error:', error);
      throw error;
    }
  },

  getLocations: async () => {
    try {
      console.log('📍 Fetching available states and districts...');
      const response = await API.get('/market/locations');
      
      if (response.data) {
        console.log('✅ Locations data received');
        return response.data;
      }
      
      return { states: [], districts: [], markets: [], commodities: [] };
    } catch (error) {
      console.error('❌ Locations fetch error:', error);
      return { states: [], districts: [], markets: [], commodities: [] };
    }
  },

  getSummary: async () => {
    try {
      console.log('📊 Fetching market summary...');
      const response = await API.get('/market/summary');
      
      if (response.data) {
        console.log('✅ Market summary received');
        return response.data;
      }
      
      return { topCrops: [] };
    } catch (error) {
      console.error('❌ Market summary fetch error:', error);
      return { topCrops: [] };
    }
  },

  sendChatMessage: async ({ message, commodity, state, district, market }) => {
    try {
      console.log(`🤖 Sending chatbot message: ${message}`);
      const response = await API.post('/market/chatbot', {
        message,
        commodity,
        state,
        district,
        market
      });
      
      if (response.data) {
        console.log('✅ Chatbot response received');
        return response.data;
      }
      
      throw new Error('No response from chatbot');
    } catch (error) {
      console.error('❌ Chatbot error:', error);
      throw error;
    }
  }
};

export default marketService;
