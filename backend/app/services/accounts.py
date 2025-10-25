from nessie.models.address import Address
from .client import curr_client  

def create_account(new_customer_id, account_type="Savings", nickname="Winter is Coming Account", rewards=0, balance=100):
    """
    Create an account for the given customer_id and retunrs the account identifier.
    """
    account_factory = curr_client.account
    account = account_factory.create_customer_account(
        new_customer_id,
        account_type,
        nickname,
        rewards,
        balance
    )
    # supports both _id and id according to the library's response. 
    return getattr(account, "_id", None) or getattr(account, "id", None)