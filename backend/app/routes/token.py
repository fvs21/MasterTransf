from fastapi import APIRouter, Depends
from typing import Annotated    
from ..core.crypto_service import CryptoService, get_crypto_service

router = APIRouter(prefix="/api/token", tags=["token"])

@router.post("/")
def get_token(crypto_service: Annotated[CryptoService, Depends(get_crypto_service)]):
    token = crypto_service.generate_token()

    return {
        "success": True,
        "result": token
    }