from fastapi import APIRouter
from app.models.authModels import RegisterRequest, RegisterResponse, UserResponse
from app.core.database import create_user
from app.services.nessie_service import NessieService
import hashlib
import secrets

router = APIRouter(prefix="/api/users", tags=["users"])

def hash_password(password: str) -> str:
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_nickname(first_name: str, last_name: str) -> str:
    """Generate a unique nickname from first and last name"""
    base = f"{first_name[0].lower()}{last_name.lower()}"
    suffix = secrets.token_hex(2)
    return f"{base}{suffix}"

@router.post("", response_model=RegisterResponse)
@router.post("/", response_model=RegisterResponse)
async def register_user(request: RegisterRequest):
    """
    Register a new user - creates customer in Nessie API and stores credentials locally
    """
    # Create address for Nessie API
    address = {
        "street_number": request.streetNumber,
        "street_name": request.streetName,
        "city": request.city,
        "state": request.state,
        "zip": request.zip
    }
    
    # Create customer in Nessie API
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
    
    # Generate nickname
    nickname = generate_nickname(request.firstName, request.lastName)
    
    # Default password (user should change this)
    default_password = "123"
    hashed_password = hash_password(default_password)
    
    # Store user in local database
    try:
        create_user(nickname, hashed_password, customer_id)
    except Exception as e:
        return RegisterResponse(
            success=False,
            message=f"Error saving user: {str(e)}"
        )
    
    # Create user response
    user_response = UserResponse(
        nickname=nickname,
        firstName=request.firstName,
        lastName=request.lastName,
        customerId=customer_id
    )
    
    return RegisterResponse(
        success=True,
        user=user_response,
        message=f"User created. Your nickname is '{nickname}' and your password is '123'."
    )
