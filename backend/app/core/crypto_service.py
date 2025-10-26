from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.exceptions import InvalidSignature
import base64

class CryptoService:
    def __init__(self, public_key_pem: bytes):
        self.public_key = serialization.load_pem_public_key(public_key_pem) #load a public key

    def verify_signature(self, message: bytes, signature_b64: str) -> bool:
        """Verify RSA signature from frontend."""
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