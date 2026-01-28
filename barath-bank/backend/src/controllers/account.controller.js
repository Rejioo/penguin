const pool = require("../config/db");

// generate readable account number
function generateAccountNumber() {
  return "BA" + Date.now() + Math.floor(Math.random() * 1000);
}

/**
 * Create primary account for user
 */
exports.createAccount = async (req, res) => {
  const userId = req.user.userId;

  const connection = await pool.getConnection();

  try {
    // check if user already has an account
    const [existing] = await connection.query(
      "SELECT id FROM accounts WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Account already exists",
      });
    }

    const accountNumber = generateAccountNumber();

    const [result] = await connection.query(
      `INSERT INTO accounts (user_id, account_number)
       VALUES (?, ?)`,
      [userId, accountNumber]
    );

    return res.status(201).json({
      message: "Account created successfully",
      account: {
        accountNumber,
        balance: 0,
        currency: "INR",
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create account" });
  } finally {
    connection.release();
  }
};

/**
 * Get user's account details
 */
// exports.getMyAccount = async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     const [rows] = await pool.query(
//       `SELECT account_number, account_type, balance, currency, status, created_at
//        FROM accounts
//        WHERE user_id = ?`,
//       [userId]
//     );

//     if (rows.length === 0) {
//       return res.status(404).json({
//         message: "No account found",
//       });
//     }

//     return res.json(rows[0]);
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Failed to fetch account" });
//   }
// };
exports.getMyAccounts = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `SELECT id,
              account_number,
              balance,
              currency,
              status,
              created_at
       FROM accounts
       WHERE user_id = ?`,
      [userId]
    );

    return res.json(rows); // always array
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch accounts" });
  }
};
/**
 * Get SINGLE account by ID (owned by user)
 * GET /api/accounts/:id
 */
exports.getAccountById = async (req, res) => {
  const userId = req.user.userId;
  const accountId = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT id,
              account_number,
              balance,
              currency,
              status,
              created_at
       FROM accounts
       WHERE id = ? AND user_id = ?`,
      [accountId, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch account" });
  }
};
