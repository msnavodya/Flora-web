import logging
import os
from datetime import datetime, timedelta
from pathlib import Path
from threading import Lock

import requests

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None


logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_ENV_PATH = BACKEND_DIR / ".env"
REPO_ROOT = BACKEND_DIR.parent
REQUEST_TIMEOUT = 20
_TOKEN_CACHE = {"access_token": None, "expires_at": datetime.min}
_TOKEN_LOCK = Lock()
_ENV_LOADED = False


class PayPalAPIError(Exception):
    def __init__(self, message, status_code=500, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}


class PayPalConfigError(PayPalAPIError):
    pass


def _mask_secret(value: str, visible=4):
    if not value:
        return ""
    if len(value) <= visible:
        return "*" * len(value)
    return f"{value[:visible]}{'*' * max(len(value) - visible, 4)}"


def _candidate_env_paths():
    return [
        DEFAULT_ENV_PATH,
        BACKEND_DIR / ".env.txt",
        REPO_ROOT / ".env",
        REPO_ROOT / ".env.txt",
    ]


def _existing_env_candidates():
    return [str(path) for path in _candidate_env_paths() if path.exists()]


def _resolve_env_path():
    if DEFAULT_ENV_PATH.exists():
        return DEFAULT_ENV_PATH
    for candidate in _candidate_env_paths():
        if candidate.exists():
            return candidate
    return DEFAULT_ENV_PATH


def _read_env_preview(env_path: Path):
    if not env_path.exists() or not env_path.is_file():
        return []

    preview = []
    for raw_line in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if "SECRET" in key or "CLIENT_ID" in key:
            value = _mask_secret(value.strip())
        preview.append(f"{key.strip()}={value.strip()}")
    return preview


def _load_env_file_manually(env_path: Path):
    if not env_path.exists() or not env_path.is_file():
        return False

    loaded_any = False
    for raw_line in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)
        loaded_any = True
    return loaded_any


def load_paypal_environment():
    global _ENV_LOADED

    if _ENV_LOADED:
        return _resolve_env_path().exists()

    if load_dotenv is None:
        env_path = _resolve_env_path()
        logger.warning("python-dotenv is not installed. Falling back to manual .env parsing.")
        logger.info("Current working directory: %s", Path.cwd())
        logger.info("Attempting to load PayPal environment from: %s", env_path)
        logger.info("Environment file candidates: %s", _existing_env_candidates() or ["<none>"])
        if env_path.exists():
            logger.info("Environment file preview: %s", _read_env_preview(env_path))
        loaded = _load_env_file_manually(env_path)
        _ENV_LOADED = True
        return loaded

    env_path = _resolve_env_path()
    logger.info("Current working directory: %s", Path.cwd())
    logger.info("Attempting to load PayPal environment from: %s", env_path)
    logger.info("Environment file candidates: %s", _existing_env_candidates() or ["<none>"])
    if env_path.exists():
        logger.info("Environment file preview: %s", _read_env_preview(env_path))

    loaded = load_dotenv(dotenv_path=env_path, override=False)
    _ENV_LOADED = True

    if loaded:
        logger.info("Loaded PayPal environment variables from %s", env_path)
    else:
        logger.warning("No usable .env file found at %s. Using process environment variables only.", env_path)

    return loaded


def _paypal_base_url():
    load_paypal_environment()
    mode = os.getenv("PAYPAL_MODE", "sandbox").strip().lower() or "sandbox"
    default_base_url = "https://api-m.paypal.com" if mode == "live" else "https://api-m.sandbox.paypal.com"
    return os.getenv("PAYPAL_BASE_URL", default_base_url).rstrip("/")


def _paypal_client_id():
    load_paypal_environment()
    return os.getenv("PAYPAL_CLIENT_ID", "").strip()


def _paypal_secret():
    load_paypal_environment()
    return os.getenv("PAYPAL_SECRET", "").strip()


def _is_live_url(base_url: str) -> bool:
    return "sandbox" not in base_url.lower()


def get_paypal_status():
    client_id = _paypal_client_id()
    secret = _paypal_secret()
    base_url = _paypal_base_url()
    env_path = _resolve_env_path()
    mode_setting = os.getenv("PAYPAL_MODE", "sandbox").strip().lower() or "sandbox"

    issues = []

    if not client_id:
        issues.append("PAYPAL_CLIENT_ID is missing")
    if not secret:
        issues.append("PAYPAL_SECRET is missing")
    if not base_url:
        issues.append("PAYPAL_BASE_URL is missing")
    if not env_path.exists():
        issues.append("No .env file was found. Create backend/.env or rename .env.txt to .env")

    if client_id and client_id.startswith("sb"):
        mode = "sandbox"
    elif client_id:
        mode = "live_or_unknown"
    else:
        mode = "unknown"

    if mode == "sandbox" and _is_live_url(base_url):
        issues.append("Sandbox client ID appears to be used with a live PayPal API URL")
    if mode == "live_or_unknown" and "sandbox" in base_url.lower():
        issues.append("Live or unknown client ID appears to be used with the PayPal Sandbox URL")

    return {
        "configured": not issues,
        "client_id_present": bool(client_id),
        "secret_present": bool(secret),
        "base_url": base_url,
        "mode": mode_setting,
        "environment_mode": mode,
        "issues": issues,
        "env_file": str(env_path),
        "env_file_exists": env_path.exists(),
        "env_candidates": _existing_env_candidates(),
        "cwd": str(Path.cwd()),
        "env_preview": _read_env_preview(env_path),
        "paypal_client_id_masked": _mask_secret(client_id),
    }


def log_paypal_status():
    status = get_paypal_status()

    logger.info(
        "PayPal config: env_file_exists=%s client_id_present=%s secret_present=%s base_url=%s mode=%s",
        status["env_file_exists"],
        status["client_id_present"],
        status["secret_present"],
        status["base_url"],
        status["environment_mode"],
    )

    for issue in status["issues"]:
        logger.warning("PayPal config issue: %s", issue)

    return status


def _require_credentials():
    status = get_paypal_status()
    if status["configured"]:
        return

    raise PayPalConfigError(
        "PayPal is not configured correctly. Check backend/.env for PAYPAL_CLIENT_ID, PAYPAL_SECRET, and Sandbox URL settings.",
        status_code=400,
        details=status,
    )


def get_paypal_client_id():
    _require_credentials()
    return _paypal_client_id()


def get_paypal_public_config():
    status = get_paypal_status()
    if not status["client_id_present"] or not status["secret_present"]:
        raise PayPalConfigError(
            "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_SECRET in backend/.env.",
            status_code=400,
            details=status,
        )

    return {
        "clientId": _paypal_client_id(),
        "mode": status["mode"],
    }


def get_access_token(force_refresh=False):
    _require_credentials()

    with _TOKEN_LOCK:
        if not force_refresh and _TOKEN_CACHE["access_token"] and _TOKEN_CACHE["expires_at"] > datetime.utcnow():
            return _TOKEN_CACHE["access_token"]

        logger.info("Requesting PayPal OAuth access token from %s", _paypal_base_url())
        response = requests.post(
            f"{_paypal_base_url()}/v1/oauth2/token",
            auth=(_paypal_client_id(), _paypal_secret()),
            headers={
                "Accept": "application/json",
                "Accept-Language": "en_US",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data={"grant_type": "client_credentials"},
            timeout=REQUEST_TIMEOUT,
        )

        if response.status_code >= 400:
            details = _safe_json(response)
            logger.error("PayPal OAuth failed with status %s: %s", response.status_code, details)
            raise PayPalAPIError(
                "Unable to authenticate with PayPal. Verify your Sandbox client ID and secret.",
                status_code=response.status_code,
                details=details,
            )

        payload = response.json()
        expires_in = int(payload.get("expires_in", 0))
        _TOKEN_CACHE["access_token"] = payload["access_token"]
        _TOKEN_CACHE["expires_at"] = datetime.utcnow() + timedelta(seconds=max(expires_in - 60, 60))
        logger.info("PayPal OAuth token acquired successfully.")
        return _TOKEN_CACHE["access_token"]


def _safe_json(response):
    try:
        return response.json()
    except ValueError:
        return {"raw": response.text}


def _paypal_request(method, path, *, json=None, expected_status=(200, 201), force_refresh=False):
    token = get_access_token(force_refresh=force_refresh)
    response = requests.request(
        method,
        f"{_paypal_base_url()}{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        json=json,
        timeout=REQUEST_TIMEOUT,
    )

    if response.status_code == 401 and not force_refresh:
        logger.warning("PayPal returned 401. Retrying once with a refreshed access token.")
        return _paypal_request(method, path, json=json, expected_status=expected_status, force_refresh=True)

    if response.status_code not in expected_status:
        details = _safe_json(response)
        logger.error("PayPal request %s %s failed with status %s: %s", method, path, response.status_code, details)
        raise PayPalAPIError(
            "PayPal request failed.",
            status_code=response.status_code,
            details=details,
        )

    return response.json()


def create_order(payload):
    logger.info("Creating PayPal order.")
    return _paypal_request(
        "POST",
        "/v2/checkout/orders",
        json=payload,
        expected_status=(201,),
    )


def capture_order(order_id):
    logger.info("Capturing PayPal order %s", order_id)
    return _paypal_request(
        "POST",
        f"/v2/checkout/orders/{order_id}/capture",
        json={},
        expected_status=(200, 201),
    )


def get_order_details(order_id):
    return _paypal_request(
        "GET",
        f"/v2/checkout/orders/{order_id}",
        expected_status=(200,),
    )
