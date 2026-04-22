import json
import os
from pathlib import Path

from utils.paypal_client import get_paypal_status, load_paypal_environment


def main():
    backend_dir = Path(__file__).resolve().parent
    default_env = backend_dir / ".env"
    env_txt = backend_dir / ".env.txt"

    print("cwd:", os.getcwd())
    print("backend_dir:", backend_dir)
    print("default_env:", default_env)
    print("default_env_exists:", default_env.exists())
    print("env_txt_exists:", env_txt.exists())

    load_paypal_environment()

    filtered = {
        key: value
        for key, value in os.environ.items()
        if key.startswith("PAYPAL_")
    }
    masked = {
        key: (value[:4] + "****") if value else ""
        for key, value in filtered.items()
    }

    print("filtered_env:", json.dumps(masked, indent=2))
    print("PAYPAL_CLIENT_ID_raw_present:", bool(os.getenv("PAYPAL_CLIENT_ID")))
    print("PAYPAL_SECRET_raw_present:", bool(os.getenv("PAYPAL_SECRET")))
    print("status:", json.dumps(get_paypal_status(), indent=2))

    os.environ["PAYPAL_CLIENT_ID"] = "manual_test_client"
    print("manual_fallback_test:", os.getenv("PAYPAL_CLIENT_ID"))


if __name__ == "__main__":
    main()
