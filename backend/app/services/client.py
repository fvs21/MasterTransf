import os

from dotenv import load_dotenv

load_dotenv()  # loads .env file with CAPITAL_API_KEY=your_key_here

API_KEY = os.getenv("NESSIE_API_KEY")