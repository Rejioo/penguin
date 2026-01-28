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
    console.error(err);
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
      `SELECT * FROM transactions WHERE id = ? AND status = 'FLAGGED'`,
      [transactionId]
    );

    if (!txn) {
      await connection.rollback();
      return res.status(404).json({
        message: "Transaction not found or already processed",
      });
    }

    // move money
    await connection.query(
      "UPDATE accounts SET balance = balance - ? WHERE id = ?",
      [txn.amount, txn.from_account_id]
    );

    await connection.query(
      "UPDATE accounts SET balance = balance + ? WHERE id = ?",
      [txn.amount, txn.to_account_id]
    );

    // mark transaction approved
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
    console.error(err);
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
    console.error(err);
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
      SELECT
        COUNT(*) AS totalUsers
      FROM users
    `);

    const [[accountStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalAccounts
      FROM accounts
    `);

    return res.json({
      totalTransactions: txnStats.totalTransactions || 0,
      flaggedTransactions: txnStats.flaggedTransactions || 0,
      successfulTransactions: txnStats.successfulTransactions || 0,
      rejectedTransactions: txnStats.rejectedTransactions || 0,
      totalUsers: userStats.totalUsers || 0,
      totalAccounts: accountStats.totalAccounts || 0,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Failed to fetch admin dashboard stats",
    });
  }
};
