const pool = require("../config/db");

exports.getMe = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [[row]] = await pool.query(
      `
      SELECT
        u.id,
        u.username,
        u.email,
        u.phone,
        u.role,
        u.created_at,

        p.full_name,
        p.address_line,
        p.city,
        p.state,
        p.pincode,
        p.employment_type,
        p.income_range,

        k.pan,
        k.aadhaar,
        k.kyc_status
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      LEFT JOIN kyc_details k ON k.user_id = u.id
      WHERE u.id = ?
      `,
      [userId]
    );

    if (!row) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: row.id,
      username: row.username,
      email: row.email,
      phone: row.phone,
      role: row.role,
      created_at: row.created_at,

      profile: {
        full_name: row.full_name,
        address_line: row.address_line,
        city: row.city,
        state: row.state,
        pincode: row.pincode,
        employment_type: row.employment_type,
        income_range: row.income_range,
      },

      kyc: {
        pan: row.pan,
        aadhaar: row.aadhaar,
        kyc_status: row.kyc_status,
      },
    });
  } catch (err) {
    console.error("getMe error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};
