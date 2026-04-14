const calculateRiskScore = async ({
  farmerId,
  weatherData,
  marketData,
  confidence,
  recentQueries
}) => {

  let scores = {
    weather: 0,
    market: 0,
    financial: 0,
    disease: 0
  };

  // 1. Weather Risk (0-100)
  if (weatherData) {
    if (weatherData.rain > 50) scores.weather = 90;
    else if (weatherData.rain > 30) scores.weather = 70;
    else if (weatherData.rain > 20) scores.weather = 50;
    else scores.weather = 20;

    if (weatherData.temperature > 38) scores.weather += 10;
    if (weatherData.humidity > 85) scores.weather += 10;
    if (weatherData.windSpeed > 40) scores.weather += 10;
  }

  // 2. Market Risk (0-100)
  if (marketData) {
    const priceVolatility = (marketData.maxPrice - marketData.minPrice) / marketData.modalPrice;
    if (priceVolatility > 0.15) scores.market = 80;
    else if (priceVolatility > 0.10) scores.market = 60;
    else if (priceVolatility > 0.05) scores.market = 40;
    else scores.market = 20;
  }

  // 3. Financial Risk (based on confidence)
  if (confidence < 50) scores.financial = 80;
  else if (confidence < 60) scores.financial = 60;
  else if (confidence < 70) scores.financial = 40;
  else scores.financial = 20;

  // 4. Disease Risk (based on recent queries)
  if (recentQueries) {
    const diseaseQueries = recentQueries.filter(q => 
      q.category === "Disease" || q.category === "Disease Detection"
    );
    if (diseaseQueries.length > 3) scores.disease = 90;
    else if (diseaseQueries.length > 1) scores.disease = 60;
    else scores.disease = 20;
  }

  // Calculate overall risk
  const overallRisk = Math.round(
    (scores.weather * 0.3) +
    (scores.market * 0.25) +
    (scores.financial * 0.25) +
    (scores.disease * 0.20)
  );

  let riskCategory = "Low";
  if (overallRisk > 70) riskCategory = "Critical";
  else if (overallRisk > 50) riskCategory = "High";
  else if (overallRisk > 30) riskCategory = "Medium";

  return {
    overallRisk,
    riskCategory,
    breakdown: {
      weather: scores.weather,
      market: scores.market,
      financial: scores.financial,
      disease: scores.disease
    }
  };
};

module.exports = { calculateRiskScore };
