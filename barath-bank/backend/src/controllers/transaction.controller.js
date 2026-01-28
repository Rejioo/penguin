const pool = require("../config/db");
const { getFraudRiskScore } = require("../services/fraud.service");
const { getDeviceHash } = require("../utils/device.util");
const geoip = require("geoip-lite");

/**
 * Simple, explainable rule-based risk scorer
 * This only BOOSTS risk, never lowers ML risk
 */


function ruleBasedRisk({
  amount,
  hour,
  isNewDevice,
  isForeign,
  txnCount24h,
}) {
  let score = 0;

  if (amount >= 10000 && amount < 50000) score += 0.35;
  if (amount >= 50000) score += 0.5;

  if (isNewDevice) score += 0.25;
  if (isForeign) score += 0.25;
  if (hour < 5 || hour > 23) score += 0.15;
  if (txnCount24h >= 5) score += 0.2;

  return Math.min(score, 1.0);
}

function calibrateMlRisk(rawRisk) {
  // Stretch low probabilities so they are visible in demos
  // Keeps range [0, 1]
  const k = 4; // steepness
  return 1 / (1 + Math.exp(-k * (rawRisk - 0.3)));
}


/**
 * Decide final action
 */
function decideAction(finalRisk) {
  if (finalRisk >= 0.75) {
    return { decision: "REJECT", status: "REJECTED" };
  }
  if (finalRisk >= 0.45) {
    return { decision: "FLAG", status: "FLAGGED" };
  }
  return { decision: "ALLOW", status: "SUCCESS" };
}

/**
 * INTERNAL TRANSFER API
 */
exports.transfer = async (req, res) => {
  const userId = req.user.userId;
  const { toAccountNumber, amount } = req.body || {};

  if (!toAccountNumber || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid transfer details" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Sender account
    const [fromRows] = await connection.query(
      `SELECT id, balance
       FROM accounts
       WHERE user_id = ? AND status = 'ACTIVE'
       LIMIT 1`,
      [userId]
    );

    if (!fromRows.length) {
      await connection.rollback();
      return res.status(400).json({ message: "Sender account not found" });
    }

    const fromAccount = fromRows[0];

    if (fromAccount.balance < amount) {
      await connection.rollback();
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 2️⃣ Receiver account
    const [toRows] = await connection.query(
      `SELECT id FROM accounts
       WHERE account_number = ? AND status = 'ACTIVE'
       LIMIT 1`,
      [toAccountNumber]
    );

    if (!toRows.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Recipient account not found" });
    }

    const toAccountId = toRows[0].id;

    // =========================
    // 3️⃣ isNewDevice (REAL)
    // =========================
    const deviceHash = getDeviceHash(req);

    const [deviceRows] = await connection.query(
      `SELECT 1
       FROM user_devices
       WHERE user_id = ? AND device_hash = ?
       LIMIT 1`,
      [userId, deviceHash]
    );

    const isNewDevice = deviceRows.length === 0;

    await connection.query(
      `INSERT INTO user_devices (user_id, device_hash)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE last_seen = NOW()`,
      [userId, deviceHash]
    );

    // =========================
    // 4️⃣ isForeign (REAL)
    // =========================
    const ip = "49.207.0.1";    
    // const ip =
    // req.headers["x-forwarded-for"]?.split(",")[0] ||
    // req.socket.remoteAddress;
    console.log("RAW IP:", ip);

    const geo = geoip.lookup(ip);
    const currentCountry = geo?.country || null;

    const [countryRows] = await connection.query(
      `SELECT country_code
       FROM user_ip_history
       WHERE user_id = ?
       GROUP BY country_code
       ORDER BY COUNT(*) DESC
       LIMIT 1`,
      [userId]
    );

    const homeCountry = countryRows.length
      ? countryRows[0].country_code
      : currentCountry;

    const isForeign =
      homeCountry  &&
      currentCountry &&
      homeCountry !== currentCountry;

    await connection.query(
      `INSERT INTO user_ip_history (user_id, ip_address, country_code)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE last_seen = NOW()`,
      [userId, ip, currentCountry]
    );

    // =========================
    // 5️⃣ txnCount24h
    // =========================
    const [[{ txnCount24h }]] = await connection.query(
      `SELECT COUNT(*) AS txnCount24h
       FROM transactions t
       JOIN accounts a ON t.from_account_id = a.id
       WHERE a.user_id = ?
       AND t.created_at >= NOW() - INTERVAL 24 HOUR`,
      [userId]
    );

    const hour = new Date().getHours();

    // =========================
    // 6️⃣ ML fraud payload
    // =========================
    const fraudPayload = {
      amount,
      hour,
      is_new_device: isNewDevice ? 1 : 0,
      is_foreign_transaction: isForeign ? 1 : 0,
      transaction_count_24h: txnCount24h,
      device_risk_score: isNewDevice ? 0.6 : 0.1,
      ip_risk_score: isForeign ? 0.7 : 0.1,
      merchant_risk_score: 0.1,
      time_since_last_txn_min: 120,
    };

    console.log("===== FRAUD FEATURES =====");
    console.log("userId:", userId);
    console.log("amount:", amount);
    console.log("hour:", hour);
    console.log("isNewDevice:", isNewDevice);
    console.log("isForeign:", isForeign);
    console.log("txnCount24h:", txnCount24h);
    console.log("deviceHash:", deviceHash);
    console.log("ip:", ip);
    console.log("currentCountry:", currentCountry);
    console.log("homeCountry:", homeCountry);
    console.log("==========================");


    // const mlRisk = await getFraudRiskScore(fraudPayload);
    const rawMlRisk = await getFraudRiskScore(fraudPayload);
    const mlRisk = calibrateMlRisk(rawMlRisk);
    let contextualBoost = 0;

    if (isNewDevice) contextualBoost += 0.05;
    if (isForeign) contextualBoost += 0.05;
    if (txnCount24h >= 5) contextualBoost += 0.05;

    const boostedMlRisk = Math.min(mlRisk + contextualBoost, 1.0);

    // =========================
    // 7️⃣ Rule-based risk
    // =========================
    const ruleRisk = ruleBasedRisk({
      amount,
      hour,
      isNewDevice,
      isForeign,
      txnCount24h,
    });

    const finalRisk = Math.max( ruleRisk);
    const { decision, status } = decideAction(finalRisk);

    console.log("=== FRAUD DEBUG ===");
    console.log({ amount, isNewDevice, isForeign, txnCount24h });
    console.log("ML:", mlRisk, "RULE:", ruleRisk, "FINAL:", finalRisk);
console.log("Boosted ML risk:", boostedMlRisk);

    console.log("DECISION:", decision);
    console.log("===================");

    // =========================
    // 8️⃣ Execute transfer
    // =========================
    if (decision === "ALLOW") {
      await connection.query(
        "UPDATE accounts SET balance = balance - ? WHERE id = ?",
        [amount, fromAccount.id]
      );

      await connection.query(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        [amount, toAccountId]
      );
    }

    // =========================
    // 9️⃣ Log transaction
    // =========================
    await connection.query(
      `INSERT INTO transactions
       (from_account_id, to_account_id, amount, status, risk_score)
       VALUES (?, ?, ?, ?, ?)`,
      [fromAccount.id, toAccountId, amount, status, finalRisk]
    );

    await connection.commit();

    if (decision !== "ALLOW") {
      return res.status(202).json({
        message: "Transaction flagged",
        riskScore: finalRisk,
        decision,
      });
    }

    return res.json({
      message: "Transfer successful",
      riskScore: finalRisk,
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ message: "Transfer failed" });
  } finally {
    connection.release();
  }
};

/**
 * TRANSACTION HISTORY
 */
exports.getMyTransactions = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `SELECT t.id,
              t.amount,
              t.status,
              t.risk_score,
              t.created_at,
              fa.account_number AS from_account,
              ta.account_number AS to_account
       FROM transactions t
       JOIN accounts fa ON t.from_account_id = fa.id
       JOIN accounts ta ON t.to_account_id = ta.id
       WHERE fa.user_id = ? OR ta.user_id = ?
       ORDER BY t.created_at DESC`,
      [userId, userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch transactions" });
  }
};
