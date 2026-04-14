const { calculateFarmerRisk } = require("../services/RiskEngine");

const getFarmerRisk = async (req, res) => {
  const { farmerId } = req.params;

  const riskData = await calculateFarmerRisk(farmerId);

  res.json(riskData);
};

module.exports = { getFarmerRisk };
