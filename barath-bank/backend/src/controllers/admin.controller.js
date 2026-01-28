const pool = require("../config/db");

/**
 * Get all flagged transactions
 */
exports.getFlaggedTransactions = async (req, res) => {
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
       WHERE t.status = 'FLAGGED'
       ORDER BY t.created_at DESC`
    );

    return res.json(rows);
  } catch (err) {
    console.error("getFlaggedTransactions error:", err);
    return res.status(500).json({
      message: "Failed to fetch flagged transactions",
    });
  }
};

/**
 * Approve flagged transaction
 */
exports.approveTransaction = async (req, res) => {
  const transactionId = req.params.id;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [[txn]] = await connection.query(
      `SELECT * FROM transactions
       WHERE id = ? AND status = 'FLAGGED'`,
      [transactionId]
    );

    if (!txn) {
      await connection.rollback();
      return res.status(404).json({
        message: "Transaction not found or already processed",
      });
    }

    // debit sender
    await connection.query(
      "UPDATE accounts SET balance = balance - ? WHERE id = ?",
      [txn.amount, txn.from_account_id]
    );

    // credit receiver
    await connection.query(
      "UPDATE accounts SET balance = balance + ? WHERE id = ?",
      [txn.amount, txn.to_account_id]
    );

    // mark success
    await connection.query(
      "UPDATE transactions SET status = 'SUCCESS' WHERE id = ?",
      [transactionId]
    );

    await connection.commit();

    return res.json({
      message: "Transaction approved and completed",
    });
  } catch (err) {
    await connection.rollback();
    console.error("approveTransaction error:", err);
    return res.status(500).json({
      message: "Approval failed",
    });
  } finally {
    connection.release();
  }
};

/**
 * Reject flagged transaction
 */
exports.rejectTransaction = async (req, res) => {
  const transactionId = req.params.id;

  try {
    const [result] = await pool.query(
      `UPDATE transactions
       SET status = 'REJECTED'
       WHERE id = ? AND status = 'FLAGGED'`,
      [transactionId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Transaction not found or already processed",
      });
    }

    return res.json({
      message: "Transaction rejected",
    });
  } catch (err) {
    console.error("rejectTransaction error:", err);
    return res.status(500).json({
      message: "Rejection failed",
    });
  }
};

/**
 * Admin dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const [[txnStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalTransactions,
        SUM(status = 'FLAGGED') AS flaggedTransactions,
        SUM(status = 'SUCCESS') AS successfulTransactions,
        SUM(status = 'REJECTED') AS rejectedTransactions
      FROM transactions
    `);

    const [[userStats]] = await pool.query(`
      SELECT COUNT(*) AS totalUsers FROM users
    `);

    const [[accountStats]] = await pool.query(`
      SELECT COUNT(*) AS totalAccounts FROM accounts
    `);

    return res.json({
      totalTransactions: Number(txnStats.totalTransactions) || 0,
      flaggedTransactions: Number(txnStats.flaggedTransactions) || 0,
      successfulTransactions: Number(txnStats.successfulTransactions) || 0,
      rejectedTransactions: Number(txnStats.rejectedTransactions) || 0,
      totalUsers: Number(userStats.totalUsers) || 0,
      totalAccounts: Number(accountStats.totalAccounts) || 0,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({
      message: "Failed to fetch admin dashboard stats",
    });
  }
};
/**
 * Get all users with KYC status
 */
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.id,
        u.email,
        u.username,
        u.role,
        p.full_name AS fullName,
        k.kyc_status AS kycStatus
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      LEFT JOIN kyc_details k ON k.user_id = u.id
      ORDER BY u.id DESC
    `);

    return res.json(rows);
  } catch (err) {
    console.error("getUsers error:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};
/**
 * Approve KYC
 */
exports.approveKyc = async (req, res) => {
  const { userId } = req.params;

  try {
    const [result] = await pool.query(
      `
      UPDATE kyc_details
      SET kyc_status = 'APPROVED', verified_at = NOW()
      WHERE user_id = ?
      `,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "KYC record not found" });
    }

    return res.json({ message: "KYC approved" });
  } catch (err) {
    console.error("approveKyc error:", err);
    return res.status(500).json({ message: "KYC approval failed" });
  }
};
/**
 * Reject KYC
 */
exports.rejectKyc = async (req, res) => {
  const { userId } = req.params;

  try {
    const [result] = await pool.query(
      `
      UPDATE kyc_details
      SET kyc_status = 'REJECTED'
      WHERE user_id = ?
      `,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "KYC record not found" });
    }

    return res.json({ message: "KYC rejected" });
  } catch (err) {
    console.error("rejectKyc error:", err);
    return res.status(500).json({ message: "KYC rejection failed" });
  }
};
