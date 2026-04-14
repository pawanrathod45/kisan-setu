const generateDecision = ({
  currentPrice,
  predictedPrice,
  rainfall,
  confidence
}) => {

  let decision = "Hold";
  let riskLevel = "Low";
  let reasoning = "";

  // Price-based decision
  if (predictedPrice && predictedPrice > currentPrice * 1.05) {
    decision = "Wait";
    reasoning = "Price expected to rise by 5%+";
  } else if (predictedPrice && predictedPrice < currentPrice * 0.95) {
    decision = "Sell Now";
    reasoning = "Price expected to drop by 5%+";
    riskLevel = "Medium";
  } else {
    decision = "Hold";
    reasoning = "Price stable, monitor market";
  }

  // Weather risk override
  if (rainfall > 50) {
    decision = "Urgent Sell";
    riskLevel = "Critical";
    reasoning = "Heavy rainfall risk - sell immediately";
  } else if (rainfall > 30) {
    riskLevel = "High";
    if (decision === "Wait") {
      decision = "Sell Now";
      reasoning = "High rainfall risk - avoid waiting";
    }
  }

  // Confidence adjustment
  if (confidence < 60) {
    riskLevel = riskLevel === "Low" ? "Medium" : riskLevel;
    reasoning += " (Low confidence prediction)";
  }

  return {
    decision,
    riskLevel,
    reasoning,
    confidence
  };
};

module.exports = { generateDecision };
