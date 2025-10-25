# file ~/Documents/hackathon/nessie_hello_world.py
from nessie.client import Client
from nessie.models.address import Address

def main():
    curr_client = Client()
    customer_factory = curr_client.customer
    new_customer_id = customer_factory.create_customer(
        "Nessy",
        "Notmonster", 
        Address("1600", "Green Street", "Henrico", "VA", "23233")
    ).customer_id

    account_factory = curr_client.account
    new_account_id = account_factory.create_customer_account(
        new_customer_id, 
        "Savings", 
        "Winter is Coming Account", 
        0, 
        100)._id

    deposit_factory = curr_client.deposit
    new_deposit = deposit_factory.create_deposit(new_account_id, "balance", 88).to_dict()['id']

if __name__ == '__main__':
    main()
