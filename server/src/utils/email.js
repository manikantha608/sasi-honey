import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ─── Transporter ──────────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

// ─── Generic send helper ──────────────────────────────────────────────────────
const sendMail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === 'test') return; // skip in test env

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Sasi Honey" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ''), // plain-text fallback
  });
};

// ─── Email templates ─────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fffbeb; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px;
               box-shadow: 0 2px 12px rgba(0,0,0,.08); overflow: hidden; }
    .header { background: #f59e0b; padding: 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 24px; letter-spacing: -0.5px; }
    .header p  { color: #fef3c7; margin: 4px 0 0; font-size: 14px; }
    .body { padding: 36px 40px; color: #374151; line-height: 1.65; }
    .body h2 { color: #111827; margin-top: 0; }
    .btn { display: inline-block; background: #f59e0b; color: #fff; text-decoration: none;
           padding: 13px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;
           margin: 20px 0; }
    .otp-box { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 8px;
               text-align: center; padding: 20px; margin: 20px 0; }
    .otp-box span { font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #b45309; }
    .footer { background: #f9fafb; padding: 20px 40px; text-align: center;
              color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍯 Sasi Honey</h1>
      <p>Pure Natural Honey Products</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Sasi Honey. All rights reserved.<br/>
      If you didn't request this email, you can safely ignore it.
    </div>
  </div>
</body>
</html>`;

// ─── Email verification ───────────────────────────────────────────────────────
export const sendEmailVerification = async (to, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  await sendMail({
    to,
    subject: '✅ Verify your Sasi Honey account',
    html: baseTemplate(`
      <h2>Welcome, ${name}! 🎉</h2>
      <p>Thank you for creating an account with Sasi Honey. Please verify your email address to complete your registration and start shopping.</p>
      <p style="text-align:center;">
        <a href="${verifyUrl}" class="btn">Verify Email Address</a>
      </p>
      <hr class="divider"/>
      <p style="font-size:13px;color:#6b7280;">
        This link expires in <strong>${process.env.EMAIL_VERIFY_EXPIRES || 60} minutes</strong>.<br/>
        Or copy and paste this URL into your browser:<br/>
        <a href="${verifyUrl}" style="color:#f59e0b;word-break:break-all;">${verifyUrl}</a>
      </p>
    `),
  });
};

// ─── OTP email ────────────────────────────────────────────────────────────────
export const sendOtpEmail = async (to, name, otp) => {
  await sendMail({
    to,
    subject: `🔑 Your Sasi Honey OTP: ${otp}`,
    html: baseTemplate(`
      <h2>Your One-Time Password</h2>
      <p>Hi ${name}, use the OTP below to verify your action. It is valid for <strong>10 minutes</strong>.</p>
      <div class="otp-box">
        <span>${otp}</span>
      </div>
      <p style="font-size:13px;color:#6b7280;">
        Never share this OTP with anyone. Sasi Honey staff will never ask for it.
      </p>
    `),
  });
};

// ─── Password reset ───────────────────────────────────────────────────────────
export const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  await sendMail({
    to,
    subject: '🔒 Reset your Sasi Honey password',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset the password for your Sasi Honey account.</p>
      <p style="text-align:center;">
        <a href="${resetUrl}" class="btn">Reset Password</a>
      </p>
      <hr class="divider"/>
      <p style="font-size:13px;color:#6b7280;">
        This link expires in <strong>${process.env.PASSWORD_RESET_EXPIRES || 15} minutes</strong>.<br/>
        If you didn't request a password reset, please ignore this email — your account is safe.
      </p>
    `),
  });
};

// ─── Welcome after Google login ───────────────────────────────────────────────
export const sendWelcomeEmail = async (to, name) => {
  await sendMail({
    to,
    subject: '🍯 Welcome to Sasi Honey!',
    html: baseTemplate(`
      <h2>Welcome to Sasi Honey, ${name}! 🎉</h2>
      <p>Your account has been created successfully via Google Sign-In.</p>
      <p>Start exploring our range of pure, natural honey products sourced from across India.</p>
      <p style="text-align:center;">
        <a href="${process.env.CLIENT_URL}/products" class="btn">Shop Now</a>
      </p>
    `),
  });
};

export default sendMail;
