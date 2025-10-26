import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)

NESSIE_API_KEY = os.getenv("NESSIE_API_KEY")

NESSIE_BASE_URL = "http://api.nessieisreal.com"

if not NESSIE_API_KEY:
    raise ValueError("FATAL ERROR: NESSIE_API_KEY not found in .env")