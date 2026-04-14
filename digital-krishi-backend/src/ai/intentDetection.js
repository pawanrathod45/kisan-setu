const detectIntent = async (question) => {
  const q = question.toLowerCase();

  if (
    q.includes("price") ||
    q.includes("rate") ||
    q.includes("market")
  ) {
    return "Market Price";
  }

  if (
    q.includes("rain") ||
    q.includes("weather") ||
    q.includes("temperature")
  ) {
    return "Weather";
  }

  if (
    q.includes("disease") ||
    q.includes("leaf") ||
    q.includes("spot") ||
    q.includes("infection")
  ) {
    return "Disease";
  }

  return "General";
};

module.exports = { detectIntent };
