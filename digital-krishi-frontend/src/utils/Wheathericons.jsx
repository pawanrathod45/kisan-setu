// src/utils/weatherIcon.js

export const getWeatherIcon = (condition) => {
  if (!condition) return "🌤️";

  condition = condition.toLowerCase();

  if (condition.includes("clear")) return "☀️";
  if (condition.includes("cloud")) return "☁️";
  if (condition.includes("rain")) return "🌧️";
  if (condition.includes("storm")) return "⛈️";
  if (condition.includes("snow")) return "❄️";

  return "🌤️";
};