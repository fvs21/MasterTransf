from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.exceptions import InvalidSignature
import base64
import os

def get_crypto_service():
    with open("app/keys/private.pem", "rb") as f:
        private_key = f.read()
    with open("app/keys/public.pem", "rb") as f:
        public_key = f.read()
    return CryptoService(public_key, private_key)

class CryptoService:
    def __init__(self, public_key_pem: bytes, private_key_pem: bytes):
        self.public_key = serialization.load_pem_public_key(public_key_pem) 
        self.private_key = serialization.load_pem_private_key(private_key_pem, password=None)

    def verify_signature(self, message: bytes, signature_b64: str) -> bool:
        try:
            signature = base64.b64decode(signature_b64)
            self.public_key.verify(
                signature,
                message,
                padding.PKCS1v15(),
                hashes.SHA256()
            )
            return True
        except InvalidSignature:
            return False

    def generate_token(self) -> dict:
        message = os.urandom(32)

        signature = self.private_key.sign(
            message,
            padding.PKCS1v15(),
            hashes.SHA256()
        )

        message_b64 = base64.b64encode(message).decode("utf-8")
        signature_b64 = base64.b64encode(signature).decode("utf-8")

        return {
            "message": message_b64,
            "signature": signature_b64
        }