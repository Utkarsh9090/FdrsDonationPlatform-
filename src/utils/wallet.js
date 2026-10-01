/**
 * wallet.js
 * Utility functions for MetaMask wallet connection via window.ethereum
 */

export function isMetaMaskInstalled() {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask
}

export async function connectWallet() {
    if (!isMetaMaskInstalled()) {
        throw new Error('MetaMask is not installed. Please install it from https://metamask.io')
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

    if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.')
    }

    return accounts[0]
}

export function shortenAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}
