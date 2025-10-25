from nessie.client import Client

# Singleton client shared across service modules
curr_client = Client()
