const Query = require("../models/Query");
const Alert = require("../models/Alert");

const calculateFarmerRisk = async (farmerId) => {

  const queries = await Query.find({ farmerId });
  const alerts = await Alert.find({ farmerId });

  const escalationCount = queries.filter(q => q.escalationRequired).length;
  const avgConfidence = queries.reduce((sum, q) => sum + (q.confidence || 0), 0) / (queries.length || 1);
  const criticalAlerts = alerts.filter(a => a.severity === "Critical").length;

  let riskScore = 0;

  if (avgConfidence < 60) riskScore += 30;
  if (escalationCount >= 3) riskScore += 30;
  if (criticalAlerts >= 2) riskScore += 40;

  let riskLevel = "Low";

  if (riskScore >= 70) riskLevel = "Critical";
  else if (riskScore >= 50) riskLevel = "High";
  else if (riskScore >= 30) riskLevel = "Medium";

  return {
    riskScore,
    riskLevel,
    escalationCount,
    avgConfidence: Math.round(avgConfidence),
    totalAlerts: alerts.length
  };
};

module.exports = { calculateFarmerRisk };
