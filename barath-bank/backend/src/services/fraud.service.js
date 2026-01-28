const axios = require("axios");

const FRAUD_ML_URL = "http://localhost:8001/predict";

async function getFraudRiskScore(payload) {
  try {
    const res = await axios.post(FRAUD_ML_URL, payload, {
      timeout: 2000, // 2s timeout, bank does not wait forever
    });

    return res.data.risk_score;
  } catch (err) {
    console.error("Fraud service error:", err.message);

    // SAFE DEFAULT: force manual review
    return 0.7;
  }
}

module.exports = {
  getFraudRiskScore,
};
