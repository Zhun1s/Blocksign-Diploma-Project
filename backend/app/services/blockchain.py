import json
import logging
import os

from web3 import Web3

from app.config import settings

logger = logging.getLogger(__name__)

# Load ABI — try file first, fallback to minimal inline ABI
_abi_path = os.path.join(os.path.dirname(__file__), "../../contracts/NDAAccess_abi.json")
if os.path.exists(_abi_path):
    with open(_abi_path) as f:
        NDA_CONTRACT_ABI = json.load(f)
else:
    NDA_CONTRACT_ABI = json.loads("""[
        {
            "inputs": [
                {"internalType": "uint256", "name": "projectId", "type": "uint256"},
                {"internalType": "uint256", "name": "userId", "type": "uint256"},
                {"internalType": "string", "name": "ndaHash", "type": "string"}
            ],
            "name": "signNDA",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "uint256", "name": "projectId", "type": "uint256"},
                {"internalType": "uint256", "name": "userId", "type": "uint256"}
            ],
            "name": "getNDAHash",
            "outputs": [
                {"internalType": "string", "name": "", "type": "string"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "uint256", "name": "projectId", "type": "uint256"},
                {"internalType": "uint256", "name": "userId", "type": "uint256"}
            ],
            "name": "getNDARecord",
            "outputs": [
                {"internalType": "string", "name": "ndaHash", "type": "string"},
                {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                {"internalType": "uint256", "name": "_userId", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {"internalType": "uint256", "name": "projectId", "type": "uint256"}
            ],
            "name": "getSignerCount",
            "outputs": [
                {"internalType": "uint256", "name": "", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]""")


def _is_configured() -> bool:
    return bool(settings.CONTRACT_ADDRESS and settings.WALLET_PRIVATE_KEY)


def get_w3() -> Web3:
    return Web3(Web3.HTTPProvider(settings.POLYGON_RPC_URL))


def get_contract(w3: Web3):
    return w3.eth.contract(
        address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
        abi=NDA_CONTRACT_ABI,
    )


async def store_nda_hash_on_chain(project_id: int, user_id: int, nda_hash: str) -> str | None:
    """Send NDA hash to Polygon smart contract. Returns tx hash or None if not configured."""
    if not _is_configured():
        logger.warning("Blockchain not configured — skipping on-chain storage")
        return None

    w3 = get_w3()
    contract = get_contract(w3)

    account = w3.eth.account.from_key(settings.WALLET_PRIVATE_KEY)
    nonce = w3.eth.get_transaction_count(account.address)
    chain_id = w3.eth.chain_id

    tx = contract.functions.signNDA(project_id, user_id, nda_hash).build_transaction(
        {
            "from": account.address,
            "nonce": nonce,
            "gas": 200_000,
            "gasPrice": w3.eth.gas_price,
            "chainId": chain_id,
        }
    )

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    tx_hex = tx_hash.hex()
    logger.info("NDA hash stored on chain: tx=%s project=%d user=%d", tx_hex, project_id, user_id)
    return tx_hex


async def verify_nda_on_chain(project_id: int, user_id: int) -> dict | None:
    """Read NDA record from blockchain. Returns dict or None if not configured."""
    if not _is_configured():
        return None

    w3 = get_w3()
    contract = get_contract(w3)

    nda_hash, timestamp, uid = contract.functions.getNDARecord(
        project_id, user_id
    ).call()

    if not nda_hash:
        return None

    return {
        "nda_hash": nda_hash,
        "timestamp": timestamp,
        "user_id": uid,
    }
