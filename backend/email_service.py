"""Gửi email OTP cho DevTask qua SMTP.

Cấu hình trong backend/.env:
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_EMAIL=your-account@gmail.com
    SMTP_APP_PASSWORD=your-new-google-app-password
"""

import logging
import os
import smtplib
import ssl
from email.message import EmailMessage

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def send_verification_email(recipient: str, code: str) -> None:
    """Gửi mã OTP tới email người đăng ký; ném ngoại lệ nếu gửi thất bại."""
    host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    port_text = os.getenv("SMTP_PORT", "587").strip()
    sender = os.getenv("SMTP_EMAIL", "").strip()
    password = "".join(os.getenv("SMTP_APP_PASSWORD", "").split())

    if not sender or not password:
        raise RuntimeError("Thiếu SMTP_EMAIL hoặc SMTP_APP_PASSWORD trong backend/.env")

    try:
        port = int(port_text)
    except ValueError as exc:
        raise RuntimeError("SMTP_PORT phải là một số nguyên (587 hoặc 465)") from exc

    if port not in (465, 587):
        raise ValueError("DevTask chỉ hỗ trợ SMTP_PORT=587 hoặc SMTP_PORT=465")

    msg = EmailMessage()
    msg["Subject"] = "DevTask - Mã xác minh email"
    msg["From"] = sender
    msg["To"] = recipient
    msg.set_content(
        f"Mã xác minh DevTask của bạn: {code}\n"
        "Mã có hiệu lực trong 5 phút.\n"
        "Không chia sẻ mã này với bất kỳ ai."
    )

    context = ssl.create_default_context()

    try:
        logger.info("SMTP STEP 1: Kết nối tới %s:%s", host, port)

        if port == 465:
            with smtplib.SMTP_SSL(host, port, timeout=20, context=context) as smtp:
                logger.info("SMTP STEP 2: Đã thiết lập kết nối SSL")
                smtp.ehlo()
                logger.info("SMTP STEP 3: EHLO thành công")
                smtp.login(sender, password)
                logger.info("SMTP STEP 4: Đăng nhập Gmail thành công")
                smtp.send_message(msg)
                logger.info("SMTP STEP 5: Gửi email thành công")
        else:
            with smtplib.SMTP(host, port, timeout=20) as smtp:
                logger.info("SMTP STEP 2: Đã nhận lời chào từ máy chủ SMTP")
                smtp.ehlo()
                logger.info("SMTP STEP 3: EHLO thành công")
                smtp.starttls(context=context)
                logger.info("SMTP STEP 4: STARTTLS thành công")
                smtp.ehlo()
                logger.info("SMTP STEP 5: EHLO sau TLS thành công")
                smtp.login(sender, password)
                logger.info("SMTP STEP 6: Đăng nhập Gmail thành công")
                smtp.send_message(msg)
                logger.info("SMTP STEP 7: Gửi email thành công")

    except smtplib.SMTPAuthenticationError:
        logger.error("SMTPAuthenticationError: Gmail từ chối đăng nhập; kiểm tra App Password mới.")
        raise
    except (smtplib.SMTPException, OSError, TimeoutError, ssl.SSLError) as exc:
        logger.error("SMTP ERROR [%s]: %s", type(exc).__name__, exc)
        raise
