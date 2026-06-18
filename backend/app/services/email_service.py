import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

logger = logging.getLogger("app")

def send_otp_email(to_email: str, otp: str):
    """
    Sends a 6-digit OTP to the provided email using Gmail SMTP.
    Requires SMTP_EMAIL and SMTP_PASSWORD to be set in .env.
    """
    # Use settings which properly loads from .env
    smtp_email = settings.smtp_email
    smtp_password = settings.smtp_password
    
    if not smtp_email or not smtp_password:
        logger.warning(f"SMTP credentials not found in settings. Falling back to console OTP: {otp} for {to_email}")
        return

    try:
        # Create message
        msg = MIMEMultipart()
        msg["From"] = smtp_email
        msg["To"] = to_email
        msg["Subject"] = "Your AI Research Assistant Verification Code"

        # HTML body
        html = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #4f46e5; text-align: center;">AI Research Assistant</h2>
              <p style="font-size: 16px; color: #374151;">Hello,</p>
              <p style="font-size: 16px; color: #374151;">Please use the following verification code to complete your registration:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827; background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px;">
                  {otp}
                </span>
              </div>
              <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 10 minutes.</p>
              <p style="font-size: 14px; color: #6b7280; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
        """
        
        msg.attach(MIMEText(html, "html"))

        # Connect to Gmail SMTP (Using SSL on Port 465 to bypass firewall blocks)
        logger.info(f"Connecting to SMTP server to send OTP to {to_email}...")
        server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=15)
        server.login(smtp_email, smtp_password)
        server.send_message(msg)
        server.quit()
        logger.info(f"OTP email successfully sent to {to_email}")
        
    except Exception as e:
        logger.error(f"SMTP failed to send OTP: {str(e)}. Attempting HTTP fallback via Resend API...")
        resend_key = os.getenv("RESEND_API_KEY")
        if resend_key:
            import httpx
            
            headers = {
                "Authorization": f"Bearer {resend_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": "Acme <onboarding@resend.dev>",
                "to": [to_email],
                "subject": "Your AI Research Assistant Verification Code",
                "html": html
            }
            try:
                res = httpx.post("https://api.resend.com/emails", headers=headers, json=payload, timeout=10)
                res.raise_for_status()
                logger.info(f"OTP email successfully sent to {to_email} via Resend HTTP API")
            except Exception as http_e:
                logger.error(f"HTTP fallback also failed: {str(http_e)}")
                raise http_e
        else:
            logger.error("No RESEND_API_KEY found for HTTP fallback. Email could not be sent.")
            raise e
