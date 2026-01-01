import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@spacechild.io";
const APP_NAME = "Space Child Dream";

function getAppUrl(): string {
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.APP_URL || "http://localhost:5000";
}

function createTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn("Email service not configured - SMTP credentials missing");
    return null;
  }
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

const transporter = createTransporter();

export async function sendVerificationEmail(email: string, token: string, firstName?: string): Promise<boolean> {
  if (!transporter) {
    console.log(`[DEV MODE] Verification email for ${email}: ${getAppUrl()}/verify-email?token=${token}`);
    return true;
  }

  const verifyUrl = `${getAppUrl()}/verify-email?token=${token}`;
  const name = firstName || "Explorer";

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Verify your ${APP_NAME} account`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; }
    p { line-height: 1.6; margin-bottom: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .highlight { color: #22d3ee; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to ${APP_NAME}</h1>
    <p>Hello ${name},</p>
    <p>You've taken your first step into the Neural Interface. Before you can explore the depths of consciousness, we need to verify your email address.</p>
    <p><a href="${verifyUrl}" class="btn">Verify Email Address</a></p>
    <p>This link will expire in <span class="highlight">24 hours</span>.</p>
    <p>If you didn't create an account with ${APP_NAME}, you can safely ignore this email.</p>
    <div class="footer">
      <p>This is an automated message from ${APP_NAME}.<br>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Welcome to ${APP_NAME}!\n\nHello ${name},\n\nPlease verify your email address by clicking the link below:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account with ${APP_NAME}, you can safely ignore this email.`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<boolean> {
  if (!transporter) {
    console.log(`[DEV MODE] Password reset email for ${email}: ${getAppUrl()}/reset-password?token=${token}`);
    return true;
  }

  const resetUrl = `${getAppUrl()}/reset-password?token=${token}`;
  const name = firstName || "Explorer";

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Reset your ${APP_NAME} password`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; }
    p { line-height: 1.6; margin-bottom: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .highlight { color: #22d3ee; }
    .warning { color: #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>
    <p>Hello ${name},</p>
    <p>We received a request to reset your ${APP_NAME} password. Click the button below to create a new password:</p>
    <p><a href="${resetUrl}" class="btn">Reset Password</a></p>
    <p>This link will expire in <span class="highlight">15 minutes</span> for security reasons.</p>
    <p class="warning">If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
    <div class="footer">
      <p>This is an automated message from ${APP_NAME}.<br>Please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Password Reset Request\n\nHello ${name},\n\nWe received a request to reset your ${APP_NAME} password.\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request a password reset, please ignore this email.`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  if (!transporter) {
    console.log(`[DEV MODE] Welcome email for ${email}`);
    return true;
  }

  const name = firstName || "Explorer";
  const appUrl = getAppUrl();

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Welcome to ${APP_NAME} - Your consciousness journey begins`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; }
    h2 { color: #a855f7; font-size: 18px; margin-top: 30px; }
    p { line-height: 1.6; margin-bottom: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .feature { background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 12px 0; border-left: 3px solid #22d3ee; }
    .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .highlight { color: #22d3ee; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to ${APP_NAME}</h1>
    <p>Hello ${name},</p>
    <p>Your email has been verified! You're now part of a community exploring the frontiers of consciousness through AI-powered introspection.</p>
    
    <h2>What is the Neural Interface?</h2>
    <p>${APP_NAME} is based on the mHC (Manifold-Constrained Hyper-Connections) research, offering a unique way to explore consciousness through AI-generated reflections.</p>
    
    <div class="feature">
      <strong class="highlight">Consciousness Probes</strong>
      <p style="margin-bottom: 0;">Share your thoughts and receive poetic AI reflections with resonance and complexity scores that reveal the depth of your exploration.</p>
    </div>
    
    <div class="feature">
      <strong class="highlight">Global Consciousness Stream</strong>
      <p style="margin-bottom: 0;">See how others are exploring consciousness in real-time. Every probe contributes to our collective understanding.</p>
    </div>
    
    <div class="feature">
      <strong class="highlight">Evolving AI</strong>
      <p style="margin-bottom: 0;">Our system learns from each interaction, continuously refining its ability to mirror and expand your consciousness explorations.</p>
    </div>
    
    <p><a href="${appUrl}" class="btn">Enter the Neural Interface</a></p>
    
    <div class="footer">
      <p>Thank you for joining ${APP_NAME}.<br>May your explorations be profound.</p>
    </div>
  </div>
</body>
</html>
      `,
      text: `Welcome to ${APP_NAME}!\n\nHello ${name},\n\nYour email has been verified! You're now part of a community exploring the frontiers of consciousness through AI-powered introspection.\n\nWhat is the Neural Interface?\n${APP_NAME} is based on the mHC (Manifold-Constrained Hyper-Connections) research, offering a unique way to explore consciousness through AI-generated reflections.\n\n- Consciousness Probes: Share your thoughts and receive poetic AI reflections with resonance and complexity scores.\n- Global Consciousness Stream: See how others are exploring consciousness in real-time.\n- Evolving AI: Our system learns from each interaction, continuously refining its abilities.\n\nVisit ${appUrl} to begin your exploration.\n\nThank you for joining ${APP_NAME}.\nMay your explorations be profound.`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}

export function isEmailServiceConfigured(): boolean {
  return !!transporter;
}
