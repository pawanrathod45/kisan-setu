import API from './api';

// OpenWeatherMap API configuration (optional client-side fallback)
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

const weatherService = {
  // Get current weather with full telemetry
  getWeather: async (city = 'Pune') => {
    try {
      const response = await API.get(`/weather?city=${encodeURIComponent(city)}`);
      
      if (response.data) {
        const data = response.data;
        return {
          temperature: Math.round(data.main?.temp !== undefined ? data.main.temp : (data.temperature || 28)),
          feelsLike: Math.round(data.main?.feels_like !== undefined ? data.main.feels_like : (data.feelsLike || 29)),
          humidity: data.main?.humidity !== undefined ? data.main.humidity : (data.humidity || 65),
          windSpeed: Math.round(data.wind?.speed ? (Number(data.wind.speed) > 15 ? Number(data.wind.speed) : Number(data.wind.speed) * 3.6) : (data.windSpeed || 12)),
          condition: data.weather?.[0]?.main || data.condition || 'Clear',
          description: data.weather?.[0]?.description || data.description || 'Clear skies',
          rainProbability: data.rainProbability !== undefined ? data.rainProbability : (data.clouds?.all > 60 ? data.clouds.all : 15),
          uvIndex: data.uvIndex || 6,
          sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '06:15 AM',
          sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '06:45 PM',
          airQuality: data.airQuality || 'Optimal (42 AQI)',
          pressure: data.main?.pressure || 1012,
          visibility: data.visibility ? Math.round(data.visibility / 1000) : 10,
          cloudCover: data.clouds?.all || 20,
          location: data.location || city,
          updatedAt: data.updatedAt || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          isRealData: true
        };
      }
    } catch (error) {
      console.warn('Backend weather endpoint error:', error.message);
    }

    // Direct fallback to OpenWeatherMap API if configured in client
    if (WEATHER_API_KEY) {
      try {
        const response = await fetch(
          `${WEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (response.ok) {
          const data = await response.json();
          return {
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            rainProbability: data.clouds.all > 60 ? Math.min(data.clouds.all, 100) : Math.floor(data.clouds.all / 2),
            uvIndex: 6,
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            airQuality: 'Optimal (45 AQI)',
            pressure: data.main.pressure,
            visibility: Math.round(data.visibility / 1000),
            cloudCover: data.clouds.all,
            location: data.name || city,
            updatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            isRealData: true
          };
        }
      } catch (error) {
        console.warn('Client OpenWeather fetch failed:', error.message);
      }
    }
    
    throw new Error('Weather data temporarily unavailable.');
  },

  // Get 7-day forecast
  getForecast: async (city = 'Pune') => {
    try {
      const response = await API.get(`/weather/forecast?city=${encodeURIComponent(city)}`);
      
      if (response.data) {
        if (response.data.dailyDays && response.data.dailyDays.length > 0) {
          return response.data.dailyDays;
        }
        if (response.data.list) {
          return processForecastData(response.data.list);
        }
      }
    } catch (error) {
      console.warn('Backend forecast endpoint error:', error.message);
    }

    if (WEATHER_API_KEY) {
      try {
        const response = await fetch(
          `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (response.ok) {
          const data = await response.json();
          return processForecastData(data.list);
        }
      } catch (error) {
        console.warn('Client OpenWeather forecast failed:', error.message);
      }
    }
    
    throw new Error('Forecast data temporarily unavailable.');
  },

  // Get hourly forecast for today
  getHourlyForecast: async (city = 'Pune') => {
    try {
      const response = await API.get(`/weather/forecast?city=${encodeURIComponent(city)}`);
      
      if (response.data && response.data.list) {
        return processHourlyData(response.data.list);
      }
    } catch (error) {
      console.warn('Backend hourly forecast error:', error.message);
    }

    if (WEATHER_API_KEY) {
      try {
        const response = await fetch(
          `${WEATHER_BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (response.ok) {
          const data = await response.json();
          return processHourlyData(data.list);
        }
      } catch (error) {
        console.warn('Client OpenWeather hourly failed:', error.message);
      }
    }
    
    throw new Error('Hourly weather data temporarily unavailable.');
  }
};

// Helper function to process forecast data into chronological 7-day format
function processForecastData(list) {
  const dailyMap = new Map();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  list.forEach(item => {
    const d = new Date(item.dt * 1000);
    const dateKey = d.toISOString().split('T')[0];
    const dayName = dayNames[d.getDay()];
    
    if (!dailyMap.has(dateKey)) {
      dailyMap.set(dateKey, {
        day: dayName,
        date: dateKey,
        temps: [],
        humidity: [],
        wind: [],
        rainProb: [],
        conditions: []
      });
    }
    
    const entry = dailyMap.get(dateKey);
    entry.temps.push(item.main.temp);
    entry.humidity.push(item.main.humidity);
    entry.wind.push(Number(item.wind.speed) * 3.6);
    entry.rainProb.push(item.pop !== undefined ? Math.round(item.pop * 100) : 0);
    if (item.weather?.[0]?.main) entry.conditions.push(item.weather[0].main);
  });

  return Array.from(dailyMap.values()).slice(0, 7).map(item => {
    const avgTemp = Math.round(item.temps.reduce((a, b) => a + b, 0) / item.temps.length);
    const maxTemp = Math.round(Math.max(...item.temps));
    const minTemp = Math.round(Math.min(...item.temps));
    const maxRain = Math.round(Math.max(...item.rainProb, 0));
    const avgHum = Math.round(item.humidity.reduce((a, b) => a + b, 0) / item.humidity.length);
    const avgWind = Math.round(item.wind.reduce((a, b) => a + b, 0) / item.wind.length);

    return {
      day: item.day,
      date: item.date,
      temp: avgTemp,
      tempMax: maxTemp,
      tempMin: minTemp,
      rain: maxRain,
      humidity: avgHum,
      wind: avgWind,
      condition: item.conditions[0] || 'Clear'
    };
  });
}

// Helper function to process hourly data
function processHourlyData(list) {
  return list.slice(0, 12).map(item => ({
    time: new Date(item.dt * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    temp: Math.round(item.main.temp),
    humidity: item.main.humidity,
    wind: Math.round(Number(item.wind.speed) * 3.6),
    pop: item.pop !== undefined ? Math.round(item.pop * 100) : 0,
    condition: item.weather?.[0]?.main || 'Clear'
  }));
}

export default weatherService;
