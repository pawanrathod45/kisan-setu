const nodemailer = require("nodemailer");

// Helper to mask email for safe logs: e.g. "pa***@gmail.com"
const maskEmail = (email) => {
  if (!email || typeof email !== "string" || !email.includes("@")) return "unknown";
  const [name, domain] = email.split("@");
  if (name.length <= 2) return `${name}***@${domain}`;
  return `${name.substring(0, 2)}***${name.slice(-1)}@${domain}`;
};

// Singleton transporter instance
let cachedTransporter = null;

const createTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "").trim();
  const emailHost = (process.env.SMTP_HOST || process.env.EMAIL_HOST || "").trim();
  const emailPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || "465", 10);
  const emailService = (process.env.EMAIL_SERVICE || "gmail").trim().toLowerCase();

  if (!emailUser || !emailPass) {
    return null;
  }

  // 1. If explicit custom host is provided (e.g. Brevo, SendGrid, Amazon SES)
  if (emailHost && emailHost !== "smtp.gmail.com") {
    cachedTransporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false,
      },
    });
    return cachedTransporter;
  }

  // 2. Standard Gmail service transport (fast, high-reliability)
  cachedTransporter = nodemailer.createTransport({
    service: emailService === "gmail" ? "gmail" : undefined,
    host: emailService !== "gmail" ? "smtp.gmail.com" : undefined,
    port: 465,
    secure: true,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 8000,
  });

  return cachedTransporter;
};

/**
 * Diagnostic helper to verify SMTP credentials on startup (without logging secrets)
 */
const verifyEmailConfig = async () => {
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const emailPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || "").trim();
  const emailService = (process.env.EMAIL_SERVICE || "gmail").trim();
  const emailHost = (process.env.SMTP_HOST || process.env.EMAIL_HOST || "").trim();

  if (!emailUser || !emailPass) {
    console.warn("⚠️ [EmailService] SMTP credentials not fully configured (EMAIL_USER or EMAIL_PASS missing).");
    return { configured: false, reason: "Missing EMAIL_USER or EMAIL_PASS" };
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn("⚠️ [EmailService] Could not initialize email transporter.");
      return { configured: false, reason: "Failed to initialize transporter" };
    }

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("SMTP verification timeout (5s)")), 5000);
      transporter.verify((err, success) => {
        clearTimeout(timer);
        if (err) reject(err);
        else resolve(success);
      });
    });

    console.log(`✅ [EmailService] SMTP connection verified successfully for ${maskEmail(emailUser)} (Service: ${emailService || emailHost || "gmail"})`);
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
 * @returns {Promise<{success: boolean, messageId?: string, error?: string, durationMs?: number}>}
 */
const sendVerificationOtpEmail = async (email, otp, name = "Farmer") => {
  const startTime = Date.now();
  const emailUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const fromAddress = (process.env.EMAIL_FROM || emailUser || "").trim();
  const transporter = createTransporter();

  if (!transporter || !emailUser) {
    const errMsg = "Email transporter not configured. Please set EMAIL_USER and EMAIL_PASS environment variables.";
    console.error(`❌ [EmailService] Email dispatch aborted: ${errMsg}`);
    return { success: false, error: errMsg, durationMs: Date.now() - startTime };
  }

  const formattedFrom = fromAddress.includes("<")
    ? fromAddress
    : `"🌾 Kisan Setu Official" <${emailUser}>`;

  const otpDigits = String(otp).trim().split("");
  const otpBoxesHtml = otpDigits
    .map(
      (digit) => `
      <td align="center" valign="middle" style="width: 44px; min-width: 40px; height: 54px; background-color: #ffffff; border: 2px solid #16a34a; border-radius: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Consolas, monospace; font-size: 32px; font-weight: 900; color: #064e3b; text-align: center; vertical-align: middle;">
        ${digit}
      </td>`
    )
    .join('<td style="width: 6px; min-width: 6px;"></td>');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kisan Setu One-Time Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4fbf6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4fbf6; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #dcfce7; box-shadow: 0 8px 30px rgba(6, 78, 59, 0.08);">
          
          <!-- Top Header Banner -->
          <tr>
            <td align="center" style="background: #052e16; background: linear-gradient(135deg, #052e16 0%, #14532d 60%, #16a34a 100%); padding: 32px 24px; text-align: center;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td align="center" style="background: rgba(255, 255, 255, 0.18); border: 1px solid rgba(255, 255, 255, 0.35); border-radius: 20px; padding: 4px 14px; font-size: 11px; font-weight: 700; color: #86efac; text-transform: uppercase; letter-spacing: 1px;">
                    🛡️ Official Security Verification
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      🌾 किसान सेतु • Kisan Setu
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <p style="margin: 0; font-size: 12px; color: #bbf7d0; font-weight: 500;">
                      National Digital Agriculture Platform
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 32px 28px 24px; color: #0f172a; text-align: left;">
              
              <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
                Namaste, ${name} 🙏
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px;">
                Welcome to <strong>Kisan Setu</strong>. Please use the official 6-digit One-Time Password (OTP) below to authenticate and verify your farmer account:
              </p>

              <!-- OTP Digits Box Container -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 2px dashed #16a34a; border-radius: 14px; margin: 24px 0; padding: 20px 12px; text-align: center;">
                <tr>
                  <td align="center">
                    <div style="font-size: 11px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 14px;">
                      ONE-TIME VERIFICATION CODE
                    </div>

                    <!-- 6-Digit Individual Badges Table (No Wrap) -->
                    <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto; white-space: nowrap;">
                      <tr>
                        ${otpBoxesHtml}
                      </tr>
                    </table>

                    <div style="font-size: 13px; font-weight: 700; color: #b91c1c; margin-top: 14px;">
                      ⏱️ Code expires in exactly 10 minutes
                    </div>

                    <div style="margin-top: 10px; font-size: 12px; color: #475569; font-weight: 600;">
                      Plain Code: <span style="font-family: Consolas, monospace; font-size: 14px; font-weight: 800; color: #166534; letter-spacing: 2px;">${otp}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Security Guidelines Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 8px; margin: 20px 0 16px; padding: 12px 14px;">
                <tr>
                  <td>
                    <div style="font-size: 13px; font-weight: 800; color: #991b1b; margin-bottom: 4px;">
                      ⚠️ Security Guidelines:
                    </div>
                    <div style="font-size: 12px; line-height: 1.5; color: #7f1d1d;">
                      • Do not share this OTP with anyone under any circumstances.<br>
                      • Official Kisan Setu personnel will <strong>NEVER</strong> ask for your verification code.<br>
                      • If you did not initiate this registration, please disregard this email.
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Highlights Box -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-top: 16px; padding: 12px 14px;">
                <tr>
                  <td style="font-size: 12px; color: #166534; line-height: 1.5;">
                    🌾 <strong>Empowering Indian Agriculture:</strong> Access real-time AGMARKNET APMC mandi rates, AI crop disease diagnostics, and precision meteorological forecasts on Kisan Setu.
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
              <div style="font-size: 12px; margin-bottom: 8px;">
                <a href="https://kisan-setu54.vercel.app/login" style="color: #15803d; text-decoration: none; font-weight: 700; margin: 0 8px;">Portal Sign In</a> •
                <a href="https://kisan-setu54.vercel.app" style="color: #15803d; text-decoration: none; font-weight: 700; margin: 0 8px;">Official Website</a>
              </div>
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                © ${new Date().getFullYear()} Kisan Setu Digital Agriculture Engine. All rights reserved.<br>
                This is an automated system notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
    const sendMailPromise = transporter.sendMail({
      from: formattedFrom,
      to: email,
      subject: `🌾 [Kisan Setu] Your Official One-Time Verification Code: ${otp}`,
      text: plainTextContent,
      html: htmlContent,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email dispatch timed out after 6s")), 6000)
    );

    const info = await Promise.race([sendMailPromise, timeoutPromise]);
    const durationMs = Date.now() - startTime;

    console.log(`✅ [EmailService] Email sent successfully to ${maskEmail(email)} (duration: ${durationMs}ms, messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId, durationMs };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    console.error(`❌ [EmailService] OTP email failed for ${maskEmail(email)} (duration: ${durationMs}ms): ${error.message}`);
    return { success: false, error: error.message, durationMs };
  }
};

module.exports = {
  maskEmail,
  sendVerificationOtpEmail,
  verifyEmailConfig,
};
