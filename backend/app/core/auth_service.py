from app.core.crypto_service import CryptoService

#load backend key
with open("app/keys/public.pem", "rb") as f:
    PUBLIC_KEY = f.read()

class CryptoAuthService:
    def __init__(self):
        self.crypto = CryptoService(PUBLIC_KEY)

    def verify_signature(self, payload: dict, signature: str) -> bool:
        import json
        message_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
        return self.crypto.verify_signature(message_bytes, signature)