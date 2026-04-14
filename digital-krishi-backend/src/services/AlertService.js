const Alert = require("../models/Alert");

const createAlert = async (farmerId, type, message, severity) => {
  await Alert.create({
    farmerId,
    type,
    message,
    severity,
  });
};

module.exports = { createAlert };
