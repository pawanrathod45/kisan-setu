import API from './api';

// OpenWeatherMap API configuration
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const weatherService = {
  // Get current weather with all details
  getWeather: async (city = 'Pune') => {
    try {
      // Try backend API first
      const response = await API.get(`/weather?city=${city}`);
      
      if (response.data) {
        const data = response.data;
        return {
          temperature: Math.round(data.main?.temp || data.temperature),
          feelsLike: Math.round(data.main?.feels_like || data.feelsLike),
          humidity: data.main?.humidity || data.humidity,
          windSpeed: Math.round((data.wind?.speed || data.windSpeed) * 3.6),
          condition: data.weather?.[0]?.main || data.condition,
          description: data.weather?.[0]?.description || data.description,
          rainProbability: data.rainProbability || (data.clouds?.all > 70 ? Math.min(data.clouds.all, 100) : Math.floor(data.clouds?.all / 2)),
          uvIndex: data.uvIndex || data.uvi || 5,
          sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          airQuality: data.airQuality || data.aqi || 50,
          pressure: data.main?.pressure,
          visibility: data.visibility ? Math.round(data.visibility / 1000) : 10,
          cloudCover: data.clouds?.all,
          location: city
        };
      }
    } catch (error) {
      console.log('Backend API failed, trying OpenWeatherMap directly...');
    }

    // Fallback to OpenWeatherMap API directly
    if (WEATHER_API_KEY) {
      try {
        const response = await fetch(
          `${WEATHER_BASE_URL}/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Weather API failed');
        
        const data = await response.json();
        
        return {
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6),
          condition: data.weather[0].main,
          description: data.weather[0].description,
          rainProbability: data.clouds.all > 70 ? Math.min(data.clouds.all, 100) : Math.floor(data.clouds.all / 2),
          uvIndex: 5,
          sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          airQuality: 50,
          pressure: data.main.pressure,
          visibility: Math.round(data.visibility / 1000),
          cloudCover: data.clouds.all,
          location: city
        };
      } catch (error) {
        console.error('OpenWeatherMap API failed:', error);
      }
    }
    
    throw new Error('Unable to fetch weather data. Please configure WEATHER_API_KEY in backend.');
  },

  // Get 7-day forecast
  getForecast: async (city = 'Pune') => {
    try {
      // Try backend API first
      const response = await API.get(`/weather/forecast?city=${city}`);
      
      if (response.data && response.data.list) {
        return processForecastData(response.data.list);
      }
    } catch (error) {
      console.log('Backend forecast failed, trying OpenWeatherMap...');
    }

    // Fallback to OpenWeatherMap API
    if (WEATHER_API_KEY) {
      try {
        const response = await fetch(
          `${WEATHER_BASE_URL}/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Forecast API failed');
        
        const data = await response.json();
        return processForecastData(data.list);
      } catch (error) {
        console.error('Forecast API failed:', error);
      }
    }
    
    throw new Error('Unable to fetch forecast data. Please configure WEATHER_API_KEY in backend.');
  },

  // Get hourly forecast for today
  getHourlyForecast: async (city = 'Pune') => {
    try {
      // Try backend API first
      const response = await API.get(`/weather/forecast?city=${city}`);
      
      if (response.data && response.data.list) {
        return processHourlyData(response.data.list);
      }
    } catch (error) {
      console.log('Backend hourly failed, trying OpenWeatherMap...');
    }

    // Fallback to OpenWeatherMap API
    if (WEATHER_API_KEY) {
      try {
        const response = await fetch(
          `${WEATHER_BASE_URL}/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Hourly forecast API failed');
        
        const data = await response.json();
        return processHourlyData(data.list);
      } catch (error) {
        console.error('Hourly forecast API failed:', error);
      }
    }
    
    throw new Error('Unable to fetch hourly data. Please configure WEATHER_API_KEY in backend.');
  }
};

// Helper function to process forecast data into 7-day format
function processForecastData(list) {
  const dailyData = {};
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  list.forEach(item => {
    const date = new Date(item.dt * 1000);
    const dayName = days[date.getDay()];
    
    if (!dailyData[dayName]) {
      dailyData[dayName] = {
        temps: [],
        humidity: [],
        wind: [],
        rainProb: [] // Changed to array to collect all pop values
      };
    }
    
    dailyData[dayName].temps.push(item.main.temp);
    dailyData[dayName].humidity.push(item.main.humidity);
    dailyData[dayName].wind.push(item.wind.speed * 3.6);
    // CRITICAL FIX: Use item.pop (Probability of Precipitation) and convert to percentage
    dailyData[dayName].rainProb.push(item.pop ? Math.round(item.pop * 100) : 0);
  });

  return Object.keys(dailyData).slice(0, 7).map(day => ({
    day,
    temp: Math.round(dailyData[day].temps.reduce((a, b) => a + b) / dailyData[day].temps.length),
    // CRITICAL FIX: Average all rain probability values for the day
    rain: Math.round(dailyData[day].rainProb.reduce((a, b) => a + b) / dailyData[day].rainProb.length),
    humidity: Math.round(dailyData[day].humidity.reduce((a, b) => a + b) / dailyData[day].humidity.length),
    wind: Math.round(dailyData[day].wind.reduce((a, b) => a + b) / dailyData[day].wind.length)
  }));
}

// Helper function to process hourly data
function processHourlyData(list) {
  return list.slice(0, 12).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity,
    wind: Math.round(item.wind.speed * 3.6)
  }));
}

export default weatherService;
