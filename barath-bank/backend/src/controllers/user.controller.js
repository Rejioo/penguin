const pool = require("../config/db");

/**
 * GET /api/user/me
 */
exports.getMe = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.email,
        u.phone,
        p.full_name AS fullName,
        k.kyc_status AS kycStatus
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      LEFT JOIN kyc_details k ON k.user_id = u.id
      WHERE u.id = ?
      `,
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Failed to fetch user profile" });
  }
};
