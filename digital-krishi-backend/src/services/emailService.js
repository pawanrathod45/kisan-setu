const nodemailer = require("nodemailer");

// Helper to mask email for safe logs: e.g. "pa***@gmail.com"
const maskEmail = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) return "unknown";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.substring(0, 2)}***${name.slice(-1)}@${domain}`;
};

// Create dynamic SMTP transporter from environment variables
const createTransporter = () => {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "").trim();
  const emailHost = (process.env.SMTP_HOST || process.env.EMAIL_HOST || "").trim();
  const emailPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "587", 10);
  const emailService = (process.env.EMAIL_SERVICE || "").trim().toLowerCase();

  if (!emailUser || !emailPass) {
    return null;
  }

  // Common timeout options to prevent hanging on cloud servers (Render, AWS, etc.)
  const timeoutOptions = {
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 15000,
  };

  // 1. If explicit service (e.g., 'gmail', 'SendGrid', 'Brevo') is provided
  if (emailService) {
    return nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      ...timeoutOptions,
    });
  }

  // 2. If SMTP Host is provided
  if (emailHost) {
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      ...timeoutOptions,
    });
  }

  // 3. Fallback: Default to Gmail if email ends with @gmail.com or no host specified
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    ...timeoutOptions,
  });
};


/**
 * Diagnostic helper to verify SMTP credentials on startup (without logging secrets)
 */
const verifyEmailConfig = async () => {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "").trim();
  const emailService = (process.env.EMAIL_SERVICE || "").trim();
  const emailHost = (process.env.SMTP_HOST || process.env.EMAIL_HOST || "").trim();

  if (!emailUser || !emailPass) {
    console.warn("⚠️ [EmailService] SMTP credentials not fully configured (EMAIL_USER/EMAIL_PASS missing).");
    return { configured: false, reason: "Missing EMAIL_USER or EMAIL_PASS" };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("⚠️ [EmailService] Could not create email transporter.");
      return { configured: false, reason: "Failed to initialize transporter" };
    }

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("SMTP verification timeout (8s)")), 8000);
      transporter.verify((err, success) => {
        clearTimeout(timer);
        if (err) reject(err);
        else resolve(success);
      });
    });

    console.log(`✅ [EmailService] SMTP connection verified successfully for ${maskEmail(emailUser)} (Service/Host: ${emailService || emailHost || "gmail"})`);
    return { configured: true, user: maskEmail(emailUser) };
  } catch (err) {
    console.error("❌ [EmailService] SMTP verification failed on startup:", err.message);
    return { configured: false, error: err.message };
  }
};

/**
 * Send Official Account Verification OTP Email
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit numeric OTP code
 * @param {string} name - Farmer / User name
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
const sendVerificationOtpEmail = async (email, otp, name = "Farmer") => {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const fromAddress = (process.env.EMAIL_FROM || emailUser || "").trim();
  const transporter = createTransporter();

  if (!transporter || !emailUser) {
    const errMsg = "Email transporter not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.";
    console.error("OTP email failed", errMsg);
    return { success: false, error: errMsg };
  }

  const formattedFrom = fromAddress.includes("<")
    ? fromAddress
    : `"🌾 Kisan Setu Official" <${emailUser}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Kisan Setu Official One-Time Verification Code</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f0fdf4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; background-color: #f0fdf4; padding: 30px 12px; box-sizing: border-box; }
        .main-card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(7, 39, 20, 0.1); border: 1px solid #dcfce7; }
        
        /* Header */
        .header { background: linear-gradient(135deg, #052e16 0%, #0d4a23 50%, #15803d 100%); padding: 36px 28px 30px; text-align: center; color: #ffffff; position: relative; }
        .badge-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; }
        .logo-title { font-size: 28px; font-weight: 900; margin: 0; color: #ffffff; letter-spacing: -0.5px; }
        .logo-subtitle { font-size: 12.5px; color: #bbf7d0; margin: 6px 0 0; font-weight: 500; letter-spacing: 0.5px; }
        
        /* Content Body */
        .body-section { padding: 36px 32px 28px; color: #0f172a; text-align: left; }
        .salutation { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
        .intro-text { font-size: 14.5px; line-height: 1.65; color: #334155; margin: 0 0 24px; }
        
        /* OTP Box */
        .otp-container { background: #f8fafc; border: 2px dashed #16a34a; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 11.5px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px; }
        .otp-digits { font-size: 40px; font-weight: 900; letter-spacing: 12px; color: #0f172a; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; padding-left: 12px; margin: 4px 0; }
        .otp-timer { font-size: 12px; font-weight: 700; color: #dc2626; margin-top: 8px; }
        
        /* Security Notice */
        .security-box { background: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 14px 16px; margin: 24px 0 16px; }
        .sec-title { font-size: 13px; font-weight: 800; color: #991b1b; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
        .sec-desc { font-size: 12px; line-height: 1.5; color: #7f1d1d; margin: 0; }
        
        /* Support & Help */
        .support-info { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px 16px; font-size: 12.5px; color: #166534; line-height: 1.5; margin-top: 16px; }
        
        /* Footer */
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 28px; text-align: center; color: #64748b; font-size: 11.5px; line-height: 1.6; }
        .footer-links { margin-bottom: 8px; }
        .footer-links a { color: #15803d; text-decoration: none; font-weight: 600; margin: 0 6px; }
        .footer-copy { color: #94a3b8; font-size: 11px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="main-card">
          
          <!-- Top Header -->
          <div class="header">
            <div class="badge-pill">
              🛡️ Official Verification Notice
            </div>
            <h1 class="logo-title">🌾 किसान सेतु • Kisan Setu</h1>
            <p class="logo-subtitle">National Digital Agriculture Platform & Farm Intelligence Engine</p>
          </div>

          <!-- Body -->
          <div class="body-section">
            <div class="salutation">Namaste, ${name} 🙏</div>
            <p class="intro-text">
              Welcome to <strong>Kisan Setu</strong>. You recently registered or requested sign-in access to your smart digital farming portal.
            </p>
            <p class="intro-text">
              Please use the official One-Time Password (OTP) below to authenticate your account:
            </p>

            <!-- OTP Box -->
            <div class="otp-container">
              <div class="otp-label">ONE-TIME VERIFICATION CODE</div>
              <div class="otp-digits">${otp}</div>
              <div class="otp-timer">⏱️ Code expires in exactly 10 minutes</div>
            </div>

            <!-- Security Advisory -->
            <div class="security-box">
              <div class="sec-title">⚠️ Security Guidelines:</div>
              <p class="sec-desc">
                • Do not share this code with anyone under any circumstances.<br>
                • Official Kisan Setu personnel, Krishi Officers, and APMC representatives will <strong>NEVER</strong> ask you for your OTP or password over phone or message.<br>
                • If you did not initiate this request, please disregard this email or secure your account.
              </p>
            </div>

            <!-- Support Helpline -->
            <div class="support-info">
              🌾 <strong>Empowering Indian Agriculture:</strong> Access real-time AGMARKNET APMC mandi rates, AI crop disease diagnostics, and precision meteorological forecasts on Kisan Setu.
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-links">
              <a href="https://kisan-setu54.vercel.app/login">Portal Sign In</a> • 
              <a href="https://kisan-setu54.vercel.app">Official Website</a>
            </div>
            <p class="footer-copy">
              © ${new Date().getFullYear()} Kisan Setu Digital Agriculture Engine. All rights reserved.<br>
              This is an automated system notification. Please do not reply directly to this email.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  const plainTextContent = `
============================================================
🌾 किसान सेतु • KISAN SETU (OFFICIAL)
National Digital Agriculture Platform
============================================================

Namaste, ${name}!

Your official One-Time Verification Code (OTP) for Kisan Setu is:

>>> ${otp} <<<

Valid for: 10 minutes

SECURITY WARNING:
- Do not share this OTP with anyone.
- Kisan Setu officials or Krishi Officers will NEVER ask for your OTP.
- If you did not request this verification, please disregard this email.

Portal: https://kisan-setu54.vercel.app/login

© ${new Date().getFullYear()} Kisan Setu. All rights reserved.
============================================================
  `.trim();

  try {
    console.log("OTP email attempted", { recipient: email });
    const sendMailPromise = transporter.sendMail({
      from: formattedFrom,
      to: email,
      subject: `🌾 [Kisan Setu] Your Official One-Time Verification Code: ${otp}`,
      text: plainTextContent,
      html: htmlContent,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email dispatch timed out after 12 seconds")), 12000)
    );

    const info = await Promise.race([sendMailPromise, timeoutPromise]);

    console.log("OTP email sent", { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("OTP email failed", error.message);
    return { success: false, error: error.message };
  }

};

module.exports = {
  sendVerificationOtpEmail,
  verifyEmailConfig,
};
