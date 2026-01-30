const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const { sendOtpEmail } = require("../utils/mailer");

// ---------------- HELPERS ----------------
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function findUserByIdentifier(connection, identifier) {
  const [rows] = await connection.query(
    "SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1",
    [identifier, identifier]
  );
  return rows[0];
}

function generateAccountNumber() {
  return "BA" + Date.now() + Math.floor(Math.random() * 1000);
}

// ---------------- REGISTER ----------------
async function register(req, res) {
  const {
    fullName,
    username,
    email,
    phone,
    password,
    addressLine,
    city,
    state,
    pincode,
    pan,
    aadhaar,
    employmentType,
    incomeRange,
  } = req.body;

  if (
    !fullName ||
    !username ||
    !email ||
    !phone ||
    !password ||
    !addressLine ||
    !city ||
    !state ||
    !pincode ||
    !pan ||
    !aadhaar ||
    !employmentType ||
    !incomeRange
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ? OR phone = ? OR username = ?",
      [email, phone, username]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [userResult] = await connection.query(
      `INSERT INTO users (email, phone, username, password_hash)
       VALUES (?, ?, ?, ?)`,
      [email, phone, username, passwordHash]
    );

    const userId = userResult.insertId;

    await connection.query(
      `INSERT INTO user_profiles
       (user_id, full_name, address_line, city, state, pincode, employment_type, income_range)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        fullName,
        addressLine,
        city,
        state,
        pincode,
        employmentType,
        incomeRange,
      ]
    );

    await connection.query(
      `INSERT INTO kyc_details (user_id, pan, aadhaar)
       VALUES (?, ?, ?)`,
      [userId, pan, aadhaar]
    );

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await connection.query(
      `INSERT INTO otp_requests (user_id, otp_code, purpose, expires_at)
       VALUES (?, ?, 'REGISTER', ?)`,
      [userId, otp, expiresAt]
    );

    await connection.commit();
    console.log("📨 Sending OTP to:", email);


    console.log("REGISTER OTP:", otp);
    await sendOtpEmail({
      to: email,
      otp,
      purpose: "REGISTER",
    });

    return res.status(201).json({
      message: "Registration successful. OTP sent.",
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ message: "Registration failed" });
  } finally {
    connection.release();
  }
}

// ---------------- LOGIN STEP 1 ----------------
async function loginStep1(req, res) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  const connection = await pool.getConnection();

  try {
    const user = await findUserByIdentifier(connection, identifier);

    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await connection.query(
      `INSERT INTO otp_requests (user_id, otp_code, purpose, expires_at)
       VALUES (?, ?, 'LOGIN', ?)`,
      [user.id, otp, expiresAt]
    );

    console.log("LOGIN OTP:", otp);
    await sendOtpEmail({
        to: user.email,
        otp,
        purpose: "LOGIN",
      });

    return res.json({ message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  } finally {
    connection.release();
  }
}

// ---------------- LOGIN STEP 2 ----------------
async function loginStep2(req, res) {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ message: "Missing OTP" });
  }

  const connection = await pool.getConnection();

  try {
    const user = await findUserByIdentifier(connection, identifier);
    if (!user) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    const [rows] = await connection.query(
      `SELECT *
       FROM otp_requests
       WHERE user_id = ?
         AND purpose = 'LOGIN'
         AND is_used = false
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    const record = rows[0];
    if (!record || record.otp_code !== otp) {
      return res.status(401).json({ message: "Invalid or expired OTP" });
    }

    await connection.query(
      "UPDATE otp_requests SET is_used = true WHERE id = ?",
      [record.id]
    );

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.json({
      accessToken: token,
      user: { id: user.id, role: user.role },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  } finally {
    connection.release();
  }
}

// ---------------- VERIFY REGISTER OTP (CREATES ACCOUNT) ----------------
async function verifyOtp(req, res) {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ message: "Missing OTP" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const user = await findUserByIdentifier(connection, identifier);
    if (!user) {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const [rows] = await connection.query(
      `SELECT *
       FROM otp_requests
       WHERE user_id = ?
         AND purpose = 'REGISTER'
         AND is_used = false
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    const record = rows[0];
    if (!record || record.otp_code !== otp) {
      await connection.rollback();
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await connection.query(
      "UPDATE otp_requests SET is_used = true WHERE id = ?",
      [record.id]
    );

    await connection.query(
      "UPDATE users SET is_email_verified = true WHERE id = ?",
      [user.id]
    );

    const [[existingAccount]] = await connection.query(
      "SELECT id FROM accounts WHERE user_id = ?",
      [user.id]
    );

    if (!existingAccount) {
      const accountNumber = generateAccountNumber();

      await connection.query(
        `INSERT INTO accounts
         (user_id, account_number, balance, currency, status)
         VALUES (?, ?, 0, 'INR', 'ACTIVE')`,
        [user.id, accountNumber]
      );
    }

    await connection.commit();

    return res.json({
      message: "OTP verified and account created",
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ message: "OTP verification failed" });
  } finally {
    connection.release();
  }
}

// ---------------- RESEND REGISTER OTP ----------------
async function resendRegisterOtp(req, res) {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: "Identifier required" });
  }

  const connection = await pool.getConnection();

  try {
    const user = await findUserByIdentifier(connection, identifier);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await connection.query(
      `INSERT INTO otp_requests (user_id, otp_code, purpose, expires_at)
       VALUES (?, ?, 'REGISTER', ?)`,
      [user.id, otp, expiresAt]
    );

    console.log("RESEND REGISTER OTP:", otp);
    await sendOtpEmail({
      to: user.email,
      otp,
      purpose: "REGISTER",
    });

    return res.json({ message: "OTP resent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Resend failed" });
  } finally {
    connection.release();
  }
}

// ---------------- EXPORTS ----------------
module.exports = {
  register,
  loginStep1,
  loginStep2,
  verifyOtp,
  resendRegisterOtp,
};
