/**
 * contract.js
 * Utility for interacting with the FDRS Donation smart contract
 * Network: Polygon Mumbai Testnet (chainId: 80001)
 */

import { ethers } from 'ethers'
import process from 'process'

// ── Config ────────────────────────────────────────────────────
// Replace this with your deployed contract address on Mumbai
export const CONTRACT_ADDRESS = process.env.ADDR

// Polygon Mumbai public RPC endpoint
const MUMBAI_RPC = 'https://rpc-mumbai.maticvigil.com'

// Minimal ABI — only the functions we need
const ABI = [
    // donate(): payable, sends MATIC to the contract
    'function donate() external payable',

    // getTotalRaised(): returns total MATIC donated so far
    'function getTotalRaised() external view returns (uint256)',
]

// ── getReadProvider ───────────────────────────────────────────
// Returns a read-only provider connected to Polygon Mumbai.
// Used for calling view functions (no wallet needed).
export function getReadProvider() {
    return new ethers.JsonRpcProvider(MUMBAI_RPC)
}

// ── getContract ───────────────────────────────────────────────
// Returns a contract instance.
// Pass a signer for write calls, or a provider for read-only calls.
export function getContract(signerOrProvider) {
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signerOrProvider)
}

// ── donate ────────────────────────────────────────────────────
// Sends `amountInMatic` MATIC to the contract's donate() function.
// Requires the user's MetaMask signer.
// @param {ethers.Signer} signer  - from getSigner() via BrowserProvider
// @param {string}        amount  - amount in MATIC, e.g. "0.01"
export async function donate(signer, amount) {
    const contract = getContract(signer)

    // Convert MATIC amount (human-readable) to wei
    const value = ethers.parseEther(amount)

    // Send the transaction — MetaMask will prompt the user to confirm
    const tx = await contract.donate({ value })

    // Wait for 1 block confirmation
    await tx.wait()

    return tx
}

// ── getTotalRaised ────────────────────────────────────────────
// Fetches the total amount donated (in MATIC) from the contract.
// Uses a read-only provider — no wallet needed.
// @returns {string} - formatted MATIC amount, e.g. "1.25"
export async function getTotalRaised() {
    const provider = getReadProvider()
    const contract = getContract(provider)

    // Call the view function — returns a BigInt in wei
    const totalWei = await contract.getTotalRaised()

    // Convert wei → MATIC (ether units) and return as string
    return ethers.formatEther(totalWei)
}
