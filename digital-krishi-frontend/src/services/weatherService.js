const weatherService = {
  getWeather: async () => {
    return {
      temperature: 28,
      humidity: 65,
      windSpeed: 12,
      condition: 'Partly Cloudy'
    };
  }
};

export default weatherService;
