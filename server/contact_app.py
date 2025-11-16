# contact_app.py
import os
import logging
import smtplib
from email.message import EmailMessage
from flask import Flask, request, jsonify

app = Flask(__name__)
app.logger.setLevel(logging.INFO)

SMTP_HOST = os.environ["SMTP_HOST"]
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
SMTP_USER = os.environ["SMTP_USER"]
SMTP_PASS = os.environ["SMTP_PASS"]
TARGET_EMAIL = os.environ["TARGET_EMAIL"]
app.logger.info(
    "SMTP config host=%s port=%s user=%s",
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
)


def send_mail(sender, message):
    email = EmailMessage()
    email["Subject"] = "New site contact"
    email["From"] = SMTP_USER
    email["To"] = TARGET_EMAIL
    email.set_content(f"From: {sender}\n\n{message}")
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
        smtp.starttls()
        smtp.login(SMTP_USER, SMTP_PASS)
        smtp.send_message(email)

@app.post("/contact")
def contact():
    email = request.form.get("email")
    message = request.form.get("message")
    if not email or not message:
        return jsonify({"ok": False, "error": "missing"}), 400
    try:
        send_mail(email, message)
    except Exception as exc:
        app.logger.exception("send failed")
        return jsonify({"ok": False, "error": "mail failed"}), 500
    return jsonify({"ok": True})
