// const pool = require("../config/db");

// /**
//  * GET /api/security/sessions
//  * Device + recent IP visibility
//  */
// exports.getSessions = async (req, res) => {
//   const userId = req.user.userId;

//   try {
//     const [rows] = await pool.query(
//       `
//       SELECT
//         d.device_hash,
//         d.first_seen AS device_first_seen,
//         d.last_seen  AS device_last_seen,
//         ip.ip_address,
//         ip.country_code,
//         ip.last_seen AS ip_last_seen
//       FROM user_devices d
//       LEFT JOIN user_ip_history ip
//         ON ip.user_id = d.user_id
//       WHERE d.user_id = ?
//       ORDER BY d.last_seen DESC
//       LIMIT 10
//       `,
//       [userId]
//     );

//     return res.json(rows);
//   } catch (err) {
//     console.error("getSessions error:", err);
//     return res.status(500).json({ message: "Failed to fetch sessions" });
//   }
// };
const pool = require("../config/db");

exports.getSessions = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Devices
    const [devices] = await pool.query(
      `SELECT
         device_hash,
         first_seen,
         last_seen
       FROM user_devices
       WHERE user_id = ?
       ORDER BY COALESCE(last_seen, first_seen) DESC`,
      [userId]
    );

    // IP history
    const [ips] = await pool.query(
      `SELECT
         ip_address,
         country_code,
         first_seen,
         last_seen
       FROM user_ip_history
       WHERE user_id = ?
       ORDER BY COALESCE(last_seen, first_seen) DESC`,
      [userId]
    );

    return res.json({
      devices,
      ips,
    });
  } catch (err) {
    console.error("getSessions error:", err);
    return res.status(500).json({
      message: "Failed to fetch security sessions",
    });
  }
};
