"""
Deploy NDAAccess contract to Polygon Amoy testnet.

Prerequisites:
    pip install web3 py-solc-x

Usage:
    export POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
    export WALLET_PRIVATE_KEY=0x_your_private_key
    python contracts/deploy.py
"""

import json
import os
import sys

from solcx import compile_source, install_solc
from web3 import Web3


def main():
    rpc_url = os.environ.get("POLYGON_RPC_URL", "https://rpc-amoy.polygon.technology")
    private_key = os.environ.get("WALLET_PRIVATE_KEY")

    if not private_key:
        print("ERROR: Set WALLET_PRIVATE_KEY environment variable")
        sys.exit(1)

    # Compile contract
    print("Installing solc 0.8.20...")
    install_solc("0.8.20")

    sol_path = os.path.join(os.path.dirname(__file__), "NDAAccess.sol")
    with open(sol_path) as f:
        source = f.read()

    print("Compiling NDAAccess.sol...")
    compiled = compile_source(source, solc_version="0.8.20", output_values=["abi", "bin"])
    contract_id, contract_interface = list(compiled.items())[0]
    abi = contract_interface["abi"]
    bytecode = contract_interface["bin"]

    # Connect to Polygon
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        print(f"ERROR: Cannot connect to {rpc_url}")
        sys.exit(1)

    chain_id = w3.eth.chain_id
    print(f"Connected to chain {chain_id} ({rpc_url})")

    account = w3.eth.account.from_key(private_key)
    balance = w3.eth.get_balance(account.address)
    print(f"Deployer: {account.address}")
    print(f"Balance: {w3.from_wei(balance, 'ether')} MATIC")

    if balance == 0:
        print("ERROR: Wallet has no MATIC. Get test MATIC from https://faucet.polygon.technology/")
        sys.exit(1)

    # Deploy
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce = w3.eth.get_transaction_count(account.address)

    tx = contract.constructor().build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": 1_500_000,
        "gasPrice": w3.eth.gas_price,
        "chainId": chain_id,
    })

    signed = account.sign_transaction(tx)
    print("Sending deploy transaction...")
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    print(f"TX hash: {tx_hash.hex()}")

    print("Waiting for confirmation...")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    contract_address = receipt.contractAddress
    print(f"\n{'='*50}")
    print(f"CONTRACT DEPLOYED!")
    print(f"Address: {contract_address}")
    print(f"TX: {tx_hash.hex()}")
    print(f"Block: {receipt.blockNumber}")
    print(f"Gas used: {receipt.gasUsed}")
    print(f"{'='*50}")

    # Save ABI
    abi_path = os.path.join(os.path.dirname(__file__), "NDAAccess_abi.json")
    with open(abi_path, "w") as f:
        json.dump(abi, f, indent=2)
    print(f"\nABI saved to {abi_path}")

    print(f"\nAdd to .env:")
    print(f"  CONTRACT_ADDRESS={contract_address}")
    print(f"  WALLET_ADDRESS={account.address}")


if __name__ == "__main__":
    main()
