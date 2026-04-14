const axios = require("axios");

const predictPrice = async (day, month, arrivalQty = 100) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/predict",
      {
        day: day || new Date().getDate(),
        month: month || new Date().getMonth() + 1,
        arrivalQty
      }
    );

    return response.data.predicted_price;

  } catch (error) {
    console.error("Prediction Error:", error.message);
    return null;
  }
};

module.exports = { predictPrice };
