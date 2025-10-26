import requests
from typing import Optional, Dict, Any
from app.services.client import API_KEY

NESSIE_BASE_URL = "http://api.nessieisreal.com"

class NessieService:
    """Service for interacting with the Nessie API"""
    
    @staticmethod
    def create_customer(first_name: str, last_name: str, address: Dict[str, str]) -> Optional[str]:
        """
        Create a customer in Nessie API
        Returns customer_id if successful, None otherwise
        """
        url = f"{NESSIE_BASE_URL}/customers?key={API_KEY}"
        payload = {
            "first_name": first_name,
            "last_name": last_name,
            "address": address
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 201:
                data = response.json()
                return data.get("objectCreated", {}).get("_id")
            return None
        except Exception as e:
            print(f"Error creating customer: {e}")
            return None
    
    @staticmethod
    def get_customer(customer_id: str) -> Optional[Dict[str, Any]]:
        """Get customer details from Nessie API"""
        url = f"{NESSIE_BASE_URL}/customers/{customer_id}?key={API_KEY}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error getting customer: {e}")
            return None
    
    @staticmethod
    def create_account(customer_id: str, account_type: str, nickname: str, 
                      rewards: int = 0, balance: int = 0) -> Optional[str]:
        """
        Create an account for a customer
        Returns account_id if successful, None otherwise
        """
        url = f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}"
        payload = {
            "type": account_type,
            "nickname": nickname,
            "rewards": rewards,
            "balance": balance
        }
        
        try:
            response = requests.post(url, json=payload)
            if response.status_code == 201:
                data = response.json()
                return data.get("objectCreated", {}).get("_id")
            return None
        except Exception as e:
            print(f"Error creating account: {e}")
            return None
    
    @staticmethod
    def get_accounts(customer_id: str = None) -> list:
        """
        Get all accounts or accounts for a specific customer
        """
        if customer_id:
            url = f"{NESSIE_BASE_URL}/customers/{customer_id}/accounts?key={API_KEY}"
        else:
            url = f"{NESSIE_BASE_URL}/accounts?key={API_KEY}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return response.json()
            return []
        except Exception as e:
            print(f"Error getting accounts: {e}")
            return []
    
    @staticmethod
    def get_account(account_id: str) -> Optional[Dict[str, Any]]:
        """Get account details"""
        url = f"{NESSIE_BASE_URL}/accounts/{account_id}?key={API_KEY}"
        
        try:
            response = requests.get(url)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error getting account: {e}")
            return None
