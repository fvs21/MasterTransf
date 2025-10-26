from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    nickname: str
    password: str

class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    streetNumber: str
    streetName: str
    city: str
    state: str
    zip: str
    password: str = "123"  # Default password

class UserResponse(BaseModel):
    nickname: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    customerId: str

class LoginResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    message: Optional[str] = None

class RegisterResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    message: Optional[str] = None

class CreateAccountRequest(BaseModel):
    type: str  # 'Credit Card', 'Savings', 'Checking'
    nickname: str
    rewards: int = 0
    balance: int = 0
