from pydantic import BaseModel
from typing import Optional
 
class DepositRequest(BaseModel):
    account_id: str
    medium: str = "balance"  # could be "balance" or "rewards"
    amount: float
    concept: Optional[str] = "Bluetooth deposit"

class Token(BaseModel):
    message: str
    signature: str

class TransferRequest(BaseModel):
    payee_id: str
    amount: float
    concept: Optional[str] = "Bluetooth transfer"
    secureToken: Token
    receiver: Optional[str]