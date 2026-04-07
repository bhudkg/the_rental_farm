import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@therentalfarm.com")


def _send(to: str, subject: str, html_body: str) -> bool:
    if not SMTP_HOST or not SMTP_USER:
        logger.warning("SMTP not configured — skipping email to %s: %s", to, subject)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, to, msg.as_string())
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return False


def send_update_reminder(owner_email: str, owner_name: str, tree_name: str, week_number: int):
    subject = f"Reminder: Post your week {week_number} update for {tree_name}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #16a34a;">The Rental Farm</h2>
        <p>Hi {owner_name},</p>
        <p>It's Sunday! Please post your <strong>week {week_number}</strong> photo or video update
        for <strong>{tree_name}</strong>.</p>
        <p>Regular updates help maintain your owner rating and keep renters happy.</p>
        <p style="color: #6b7280; font-size: 13px;">
            Missing updates may affect your owner rating.
        </p>
    </div>
    """
    _send(owner_email, subject, html)


def send_new_update_notification(renter_email: str, renter_name: str, tree_name: str, week_number: int):
    subject = f"New update on your tree: {tree_name}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #16a34a;">The Rental Farm</h2>
        <p>Hi {renter_name},</p>
        <p>Great news! The owner just posted a <strong>week {week_number}</strong> update
        for your <strong>{tree_name}</strong>.</p>
        <p>Log in to check the latest photos and videos of your tree.</p>
    </div>
    """
    _send(renter_email, subject, html)


def send_penalty_notification(owner_email: str, owner_name: str, tree_name: str, penalty_added: float):
    subject = f"Rating affected: missed update for {tree_name}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #16a34a;">The Rental Farm</h2>
        <p>Hi {owner_name},</p>
        <p>You missed last week's update for <strong>{tree_name}</strong>.</p>
        <p>A penalty of <strong>{penalty_added}</strong> has been applied to your owner rating score.
        Please make sure to post updates every Sunday to maintain a good rating.</p>
    </div>
    """
    _send(owner_email, subject, html)
