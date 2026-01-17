import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@spacechild.io";
const APP_NAME = "Space Child Dream";

function getAppUrl(): string {
  // Production always uses spacechild.love
  if (process.env.NODE_ENV === "production") {
    return process.env.APP_URL || "https://spacechild.love";
  }
  // Development uses the dev domain
  if (process.env.REPLIT_DEV_DOMAIN) {
    return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  }
  return process.env.APP_URL || "http://localhost:5000";
}

const MASCOT_IMAGE_URL = "https://spacechild.love/mascot-email.png";

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
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
    p { line-height: 1.8; margin-bottom: 16px; color: #ffffff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); font-size: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    .footer { margin-top: 30px; font-size: 13px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .footer p { color: #cbd5e1; text-shadow: none; }
    .highlight { color: #22d3ee; text-shadow: 0 0 15px rgba(34, 211, 238, 0.6); }
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
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
    p { line-height: 1.8; margin-bottom: 16px; color: #ffffff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); font-size: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    .footer { margin-top: 30px; font-size: 13px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .footer p { color: #cbd5e1; text-shadow: none; }
    .highlight { color: #22d3ee; text-shadow: 0 0 15px rgba(34, 211, 238, 0.6); }
    .warning { color: #fbbf24; text-shadow: 0 0 15px rgba(251, 191, 36, 0.5); }
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
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
    h2 { color: #a855f7; font-size: 18px; margin-top: 30px; text-shadow: 0 0 15px rgba(168, 85, 247, 0.5); }
    p { line-height: 1.8; margin-bottom: 16px; color: #ffffff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); font-size: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    .feature { background: rgba(255,255,255,0.08); padding: 16px; border-radius: 8px; margin: 12px 0; border-left: 3px solid #22d3ee; }
    .feature p { margin-bottom: 0; color: #ffffff; }
    .footer { margin-top: 30px; font-size: 13px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .footer p { color: #cbd5e1; text-shadow: none; }
    .highlight { color: #22d3ee; text-shadow: 0 0 15px rgba(34, 211, 238, 0.6); }
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
      <p>Share your thoughts and receive poetic AI reflections with resonance and complexity scores that reveal the depth of your exploration.</p>
    </div>
    
    <div class="feature">
      <strong class="highlight">Global Consciousness Stream</strong>
      <p>See how others are exploring consciousness in real-time. Every probe contributes to our collective understanding.</p>
    </div>
    
    <div class="feature">
      <strong class="highlight">Evolving AI</strong>
      <p>Our system learns from each interaction, continuously refining its ability to mirror and expand your consciousness explorations.</p>
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

export async function sendMarketingEmail(
  email: string,
  firstName: string | null,
  subject: string,
  content: { headline: string; highlights: string[]; cta: { text: string; url: string } }
): Promise<boolean> {
  if (!transporter) {
    console.log(`[DEV MODE] Marketing email for ${email}: ${subject}`);
    return true;
  }

  const name = firstName || "Explorer";
  const appUrl = getAppUrl();

  const highlightsHtml = content.highlights
    .map(h => `<div class="highlight-item"><span class="bullet">✦</span> ${h}</div>`)
    .join("");
  const highlightsText = content.highlights.map(h => `• ${h}`).join("\n");

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0a0a0f; color: #e2e8f0; margin: 0; padding: 24px; line-height: 1.6; }
    .container { max-width: 560px; margin: 0 auto; background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%); border-radius: 20px; padding: 0; border: 1px solid rgba(34, 211, 238, 0.2); overflow: hidden; }
    .header { background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%); padding: 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .mascot { width: 80px; height: 80px; margin-bottom: 16px; }
    .brand { color: #22d3ee; font-size: 14px; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
    .content { padding: 32px 40px; }
    h1 { color: #ffffff; margin: 0 0 24px 0; font-size: 26px; font-weight: 600; line-height: 1.3; }
    p { margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px; line-height: 1.7; }
    .greeting { color: #a855f7; font-weight: 500; }
    .highlights { margin: 28px 0; }
    .highlight-item { background: rgba(34, 211, 238, 0.08); padding: 16px 20px; border-radius: 12px; margin: 12px 0; border-left: 3px solid #22d3ee; }
    .highlight-item p { margin: 0; color: #e2e8f0; font-size: 15px; }
    .bullet { color: #a855f7; margin-right: 10px; font-size: 12px; }
    .cta-section { text-align: center; padding: 8px 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 30px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 24px rgba(168, 85, 247, 0.35); }
    .footer { background: rgba(0,0,0,0.3); padding: 24px 40px; text-align: center; }
    .footer p { color: #64748b; font-size: 13px; margin: 0 0 12px 0; }
    .footer a { color: #22d3ee; text-decoration: none; }
    .signoff { color: #94a3b8; font-style: italic; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${MASCOT_IMAGE_URL}" alt="Space Child" class="mascot" onerror="this.style.display='none'">
      <p class="brand">Space Child</p>
    </div>
    <div class="content">
      <h1>${content.headline}</h1>
      <p><span class="greeting">Hello ${name},</span></p>
      <p>Here's what's happening in the Space Child ecosystem this week:</p>
      
      <div class="highlights">
        ${highlightsHtml}
      </div>
      
      <div class="cta-section">
        <a href="${content.cta.url}" class="btn">${content.cta.text}</a>
      </div>
    </div>
    <div class="footer">
      <p class="signoff">Stay curious, stay conscious.</p>
      <p>You're receiving this because you subscribed to marketing updates.<br>
      <a href="${appUrl}/dashboard?tab=settings">Manage preferences</a></p>
    </div>
  </div>
</body>
</html>
      `,
      text: `${content.headline}\n\nHello ${name},\n\nHere's what's happening in the Space Child ecosystem this week:\n\n${highlightsText}\n\n${content.cta.text}: ${content.cta.url}\n\nStay curious, stay conscious.\n\nManage your email preferences: ${appUrl}/dashboard?tab=settings`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send marketing email:", error);
    return false;
  }
}

export async function sendNewAppNotification(
  email: string,
  firstName: string | null,
  appName: string,
  appDescription: string,
  category: string,
  appUrl: string
): Promise<boolean> {
  if (!transporter) {
    console.log(`[DEV MODE] New app notification for ${email}: ${appName} in ${category}`);
    return true;
  }

  const name = firstName || "Explorer";
  const baseUrl = getAppUrl();

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `New in Space Child: ${appName} just launched!`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
    p { line-height: 1.8; margin-bottom: 16px; color: #ffffff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); font-size: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    .app-card { background: rgba(255,255,255,0.08); padding: 24px; border-radius: 12px; margin: 20px 0; border: 1px solid rgba(34, 211, 238, 0.3); }
    .category-badge { display: inline-block; background: rgba(168, 85, 247, 0.3); color: #a855f7; padding: 4px 12px; border-radius: 20px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .footer { margin-top: 30px; font-size: 13px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .footer p { color: #cbd5e1; text-shadow: none; }
    .unsubscribe { color: #94a3b8; font-size: 12px; }
    .unsubscribe a { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>A New App Has Arrived</h1>
    <p>Hello ${name},</p>
    <p>We're excited to announce a new addition to the Space Child ecosystem:</p>
    
    <div class="app-card">
      <span class="category-badge">${category}</span>
      <h2 style="color: #22d3ee; margin: 8px 0; font-size: 20px;">${appName}</h2>
      <p style="margin-bottom: 0;">${appDescription}</p>
    </div>
    
    <p><a href="${appUrl}" class="btn">Explore ${appName}</a></p>
    
    <div class="footer">
      <p>Expanding consciousness, one app at a time.</p>
      <p class="unsubscribe">You're receiving this because you subscribed to new app notifications.<br>
      <a href="${baseUrl}/dashboard?tab=settings">Manage your email preferences</a></p>
    </div>
  </div>
</body>
</html>
      `,
      text: `A New App Has Arrived\n\nHello ${name},\n\nWe're excited to announce a new addition to the Space Child ecosystem:\n\n${category.toUpperCase()}\n${appName}\n${appDescription}\n\nExplore ${appName}: ${appUrl}\n\nExpanding consciousness, one app at a time.\n\nManage your email preferences: ${baseUrl}/dashboard?tab=settings`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send new app notification:", error);
    return false;
  }
}

export async function sendPlatformUpdateEmail(
  email: string,
  firstName: string | null,
  updateTitle: string,
  updateContent: string
): Promise<boolean> {
  if (!transporter) {
    console.log(`[DEV MODE] Platform update email for ${email}: ${updateTitle}`);
    return true;
  }

  const name = firstName || "Explorer";
  const appUrl = getAppUrl();

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_EMAIL}>`,
      to: email,
      subject: `Space Child Update: ${updateTitle}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a0f; color: #ffffff; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #22d3ee; margin-bottom: 20px; font-size: 24px; text-shadow: 0 0 20px rgba(34, 211, 238, 0.5); }
    p { line-height: 1.8; margin-bottom: 16px; color: #ffffff; text-shadow: 0 0 10px rgba(255, 255, 255, 0.3); font-size: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
    .update-content { background: rgba(255,255,255,0.08); padding: 24px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #22d3ee; }
    .footer { margin-top: 30px; font-size: 13px; color: #cbd5e1; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; }
    .footer p { color: #cbd5e1; text-shadow: none; }
    .unsubscribe { color: #94a3b8; font-size: 12px; }
    .unsubscribe a { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${updateTitle}</h1>
    <p>Hello ${name},</p>
    
    <div class="update-content">
      ${updateContent}
    </div>
    
    <p><a href="${appUrl}/dashboard" class="btn">Go to Dashboard</a></p>
    
    <div class="footer">
      <p>Thank you for being part of Space Child.</p>
      <p class="unsubscribe">You're receiving this because you subscribed to platform updates.<br>
      <a href="${appUrl}/dashboard?tab=settings">Manage your email preferences</a></p>
    </div>
  </div>
</body>
</html>
      `,
      text: `${updateTitle}\n\nHello ${name},\n\n${updateContent.replace(/<[^>]*>/g, '')}\n\nGo to Dashboard: ${appUrl}/dashboard\n\nThank you for being part of Space Child.\n\nManage your email preferences: ${appUrl}/dashboard?tab=settings`,
    });
    return true;
  } catch (error) {
    console.error("Failed to send platform update email:", error);
    return false;
  }
}
