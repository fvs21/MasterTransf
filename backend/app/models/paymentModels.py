from pydantic import BaseModel

 
class DepositRequest(BaseModel):
    account_id: str
    medium: str = "balance"  # could be "balance" or "rewards"
    amount: float
    description: str | None = "Bluetooth deposit"

class TransferRequest(BaseModel):
    payer_id: str
    payee_id: str
    amount: float
    medium: str = "balance"
    description: str | None = "Bluetooth transfer"