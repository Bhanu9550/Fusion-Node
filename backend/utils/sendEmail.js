const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, otp) => {
  try {
    const fromEmail =
      process.env.EMAIL_FROM ||
      `"Fusion Node - No Reply" <${process.env.EMAIL_USER}>`;

    await transporter.sendMail({
      from: fromEmail,
      to: to,
      subject: subject,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 15px;">
              <p>Dear User,</p>
              <p>
                Thank you for choosing FusionNode.
              </p>
              <p>
                Your One-Time Password (OTP) for email verification is:
              </p>
              <div style="
                text-align: center;
                font-size: 30px;
                font-weight: bold;
                color: #0cee3d;
                letter-spacing: 6px;
                margin: 20px 0;
              ">
                ${otp}
              </div>
              <p>
                This OTP is valid for <strong style="color: #f55308;">5 minutes</strong>.
                Please do not share it with anyone.
              </p>
              <p>
                If you did not request this verification code,
                please ignore this email.
              </p>
              <p>
                Best regards,<br>
                <strong>The FusionNode Team</strong>
              </p>
              <hr>
              <p style="text-align: center; color: #888; font-size: 12px;">
                This is an automated email from FusionNode.
              </p>
            </div> ` 
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error.message);
    throw new Error(`Email service failed: ${error.message}`);
  }
};

module.exports = sendEmail;
