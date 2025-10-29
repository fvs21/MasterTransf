import json
from fastapi import APIRouter, HTTPException, WebSocket, Depends
from app.services.client import API_KEY
from app.models.paymentModels import DepositRequest, TransferRequest
from app.models.authModels import CreateAccountRequest
from app.services.nessie_service import NessieService
from app.core.auth import get_current_user
from datetime import date
from typing import Optional
from ..core.connections import manager
from ..core.crypto_service import CryptoService, get_crypto_service

router = APIRouter(prefix="/api/payments", tags=["payments"])

@router.post("/transfer")
async def make_transfer(body: TransferRequest, crypto_service: CryptoService = Depends(get_crypto_service)):
    token = body.secureToken

    if not crypto_service.verify_signature(token.message, token.signature):
        raise HTTPException(status_code=401, detail="Invalid signature") 

    try:
        '''
        url = f"http://api.nessieisreal.com/accounts/{body.payer_id}/transfers?key={API_KEY}"
        payload = {
            "medium":body.medium,
            "payee_id": body.payee_id,
            "amount": body.amount,
            "transaction_date": str(date.today()),
            "status": "pending",
            "description": body.concept
        }

        response = requests.post(url, json=payload)

        if response.status_code != 201:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Transfer failed: {response.text}"
            )
        '''

        await manager.broadcast(f"single/{body.payee_id}", json.dumps({
            "type": "transfer-received",
            "data": {
                "amount": body.amount,
                "concept": body.concept,
                "payer": "Fabrizio Vanzani"
            }
        }))
        
        return {
            "success":True,
            "result": "Transfer successful"
        }
    
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error performing transfer: {e}")

@router.get("/accounts")
def get_all_accounts(
    current_user: dict = Depends(get_current_user),
    customer_id: Optional[str] = None
):
    """
    Get all accounts for the authenticated user or a specific customer
    """
    try:
        # Use the authenticated user's customer_id if not specified
        if not customer_id:
            customer_id = current_user.get("customer_id")
        
        accounts = NessieService.get_accounts(customer_id)
        return accounts
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error getting accounts: {e}")

@router.get("/accounts/{account_id}")
def get_account(account_id: str):
    """
    Get specific account details
    """
    try:
        account = NessieService.get_account(account_id)
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        return account
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error getting account: {e}")

@router.post("/customers/{customer_id}/accounts")
def create_account(customer_id: str, body: CreateAccountRequest):
    """
    Create a new account for a customer
    """
    try:
        account_id = NessieService.create_account(
            customer_id=customer_id,
            account_type=body.type,
            nickname=body.nickname,
            rewards=body.rewards,
            balance=body.balance
        )
        
        if not account_id:
            raise HTTPException(
                status_code=400,
                detail="Failed to create account"
            )
        
        return {
            "success": True,
            "message": "Account created successfully",
            "objectCreated": {
                "_id": account_id
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error creating account: {e}")

@router.websocket("/ws/terminal/single/{payee_id}")
async def websocket_endpoint(websocket: WebSocket, payee_id: str):
    await manager.connect(f"single/{payee_id}", websocket)
    try:
        while True:
            _ = await websocket.receive_text()
    except Exception:
        manager.disconnect(f"single/{payee_id}", websocket)