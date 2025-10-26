from fastapi import APIRouter, HTTPException
from app.services.client import API_KEY
from app.models.paymentModels import DepositRequest, TransferRequest
from datetime import date
import requests


router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/transfer")
def make_transfer(body: TransferRequest):
    try:
        url=f"http://api.nessieisreal.com/accounts/{body.payer_id}/transfers?key={API_KEY}"
        payload={
            "medium":body.medium,
            "payee_id": body.payee_id,
            "amount": body.amount,
            "transaction_date": str(date.today()),
            "status": "pending",
            "description": body.description
        }

        response=requests.post(url, json=payload)

        if response.status_code != 201:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Transfer failed: {response.text}"
            )
        
        return {
            "success":True,
            "result": response.json()
        }
    
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Error performing transfer: {e}")
    

