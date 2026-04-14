const analyticsService = {
  getPriceTrend: async () => {
    return [
      { day: 'Mon', price: 2300 },
      { day: 'Tue', price: 2400 },
      { day: 'Wed', price: 2350 },
      { day: 'Thu', price: 2500 },
      { day: 'Fri', price: 2450 },
      { day: 'Sat', price: 2550 },
      { day: 'Sun', price: 2600 }
    ];
  },
  getYieldTrend: async () => {
    return [
      { month: 'Jan', yield: 80 },
      { month: 'Feb', yield: 85 },
      { month: 'Mar', yield: 90 },
      { month: 'Apr', yield: 95 },
      { month: 'May', yield: 100 }
    ];
  }
};

export default analyticsService;
