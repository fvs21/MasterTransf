from .client import curr_client
from nessie.models.address import Address
from . import accounts, deposit 

def main():
    customer_factory = curr_client.customer
    new_customer_id = customer_factory.create_customer(
        "Nessy",
        "Notmonster", 
        Address("1600", "Green Street", "Henrico", "VA", "23233")
    ).customer_id

    # create account using accounts.create_account and getting the id 
    new_account_id = accounts.create_account(new_customer_id)

    # create deposit in the new created account using deposit.create_deposit
    new_deposit = deposit.create_deposit(new_account_id, 88)


if __name__ == '__main__':
    main()