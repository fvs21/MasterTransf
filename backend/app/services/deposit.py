from .client import curr_client

def create_deposit(account_id, amount, deposit_type="balance"):
    """
    Creates a deposit in account_id, returns the deposit id or None.
    """
    deposit_factory = curr_client.deposit
    result = deposit_factory.create_deposit(account_id, deposit_type, amount)
    # Getting id
    try:
        return result.to_dict().get('id')
    except Exception:
        return getattr(result, "id", None) or getattr(result, "deposit_id", None)
