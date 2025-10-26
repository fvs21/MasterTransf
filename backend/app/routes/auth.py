from fastapi import APIRouter
from app.models.authModels import (
    LoginRequest, 
    LoginResponse, 
    RegisterRequest, 
    RegisterResponse,
    UserResponse
)
from app.core.database import get_user_by_nickname, create_user
from app.services.nessie_service import NessieService
from app.core.auth import create_access_token
import hashlib
import secrets

router = APIRouter(prefix="/api/auth", tags=["auth"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_nickname(first_name: str, last_name: str) -> str:
    base = f"{first_name[0].lower()}{last_name.lower()}"
    suffix = secrets.token_hex(2)
    return f"{base}{suffix}"

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = get_user_by_nickname(request.nickname)
    
    if not user:
        return LoginResponse(
            success=False,
            message="User not found."
        )
    
    hashed_password = hash_password(request.password)
    if user["password"] != hashed_password:
        return LoginResponse(
            success=False,
            message="Incorrect password."
        )
    
    customer = NessieService.get_customer(user["customer_id"])
    
    if not customer:
        return LoginResponse(
            success=False,
            message="Error retrieving user information."
        )
    
    user_response = UserResponse(
        nickname=user["nickname"],
        firstName=customer.get("first_name"),
        lastName=customer.get("last_name"),
        customerId=user["customer_id"]
    )
    
    # Create JWT token with user information
    token_data = {
        "sub": user["nickname"],
        "customer_id": user["customer_id"]
    }
    token = create_access_token(token_data)
    
    return LoginResponse(
        success=True,
        user=user_response,
        token=token
    )

@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    address = {
        "street_number": request.streetNumber,
        "street_name": request.streetName,
        "city": request.city,
        "state": request.state,
        "zip": request.zip
    }
    
    customer_id = NessieService.create_customer(
        first_name=request.firstName,
        last_name=request.lastName,
        address=address
    )
    
    if not customer_id:
        return RegisterResponse(
            success=False,
            message="Error creating user in system."
        )
    
    nickname = generate_nickname(request.firstName, request.lastName)

    hashed_password = hash_password(request.password)
    
    try:
        create_user(nickname, hashed_password, customer_id)
    except Exception as e:
        return RegisterResponse(
            success=False,
            message=f"Error saving user: {str(e)}"
        )
    
    user_response = UserResponse(
        nickname=nickname,
        firstName=request.firstName,
        lastName=request.lastName,
        customerId=customer_id
    )
    
    # Create JWT token for auto-login
    token_data = {
        "sub": nickname,
        "customer_id": customer_id
    }
    token = create_access_token(token_data)
    
    return RegisterResponse(
        success=True,
        user=user_response,
        token=token,
        message=f"User created"
    )
