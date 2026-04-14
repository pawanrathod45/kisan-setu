const marketService = {
  getMarketData: async () => {
    return {
      crop: 'Wheat',
      price: 2500,
      trend: 'up',
      change: 5
    };
  },
  getSummary: async () => {
    return {
      topCrops: [
        { name: 'Wheat', price: '₹2500/q', trend: 'up', change: '+5%' },
        { name: 'Rice', price: '₹3200/q', trend: 'up', change: '+3%' },
        { name: 'Cotton', price: '₹5800/q', trend: 'down', change: '-2%' }
      ],
      prediction: 'Good time to sell wheat'
    };
  }
};

export default marketService;
