import json
import os
from datetime import datetime
from threading import Lock
from uuid import uuid4


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_FILE = os.path.join(BASE_DIR, "users.local.json")
LOGIN_HISTORY_FILE = os.path.join(BASE_DIR, "login_history.local.json")
_LOCK = Lock()


def _read_json(path, default):
    if not os.path.exists(path):
        return default

    try:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)
    except (json.JSONDecodeError, OSError):
        return default


def _write_json(path, data):
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


def find_user_by_email(email):
    normalized_email = email.lower()
    users = _read_json(USERS_FILE, [])
    return next((user for user in users if user.get("email") == normalized_email), None)


def create_user(user_data):
    with _LOCK:
        users = _read_json(USERS_FILE, [])
        normalized_email = user_data["email"].lower()

        if any(user.get("email") == normalized_email for user in users):
            return None

        stored_user = {
            "_id": str(uuid4()),
            "full_name": user_data["full_name"],
            "email": normalized_email,
            "hashed_password": user_data["hashed_password"],
            "contact": user_data.get("contact"),
            "location": user_data.get("location"),
            "created_at": datetime.utcnow().isoformat(),
            "is_active": True,
        }
        users.append(stored_user)
        _write_json(USERS_FILE, users)
        return stored_user


def save_login(login_record):
    with _LOCK:
        records = _read_json(LOGIN_HISTORY_FILE, [])
        records.append(login_record)
        _write_json(LOGIN_HISTORY_FILE, records)
