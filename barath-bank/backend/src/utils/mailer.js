const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail({ to, otp, purpose }) {
  const subject =
    purpose === "REGISTER"
      ? "SmartBank – Verify your account"
      : "SmartBank – Login verification";

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6">
      <h2>SmartBank</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="letter-spacing:4px">${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <hr />
      <small>© SmartBank Security System</small>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
}

module.exports = { sendOtpEmail };
