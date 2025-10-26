from fastapi import APIRouter, Depends
from app.core.auth import get_current_user
from app.services.nessie_service import NessieService

router = APIRouter(prefix="/api/protected", tags=["protected"])

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current user information from token
    """
    customer_id = current_user.get("customer_id")
    nickname = current_user.get("sub")
    
    customer = NessieService.get_customer(customer_id)
    
    return {
        "success": True,
        "user": {
            "nickname": nickname,
            "customerId": customer_id,
            "firstName": customer.get("first_name") if customer else None,
            "lastName": customer.get("last_name") if customer else None,
        }
    }

@router.get("/accounts")
async def get_user_accounts(current_user: dict = Depends(get_current_user)):
    """
    Get all accounts for the authenticated user
    """
    customer_id = current_user.get("customer_id")
    accounts = NessieService.get_customer_accounts(customer_id)
    
    return {
        "success": True,
        "accounts": accounts or []
    }
