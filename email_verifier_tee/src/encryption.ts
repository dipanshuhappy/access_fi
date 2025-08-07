import {
  keccak256,
  toHex,
  fromHex,
  concat,
  hexToBytes,
  bytesToHex
} from 'viem'
import { generatePrivateKey, privateKeyToAccount, privateKeyToAddress } from 'viem/accounts'
import * as crypto from 'crypto'



/**
 * Simple encryption using viem's keccak256 and XOR
 * Works everywhere viem works - no additional dependencies
 */
export class SimpleViemEncryption {
  /**
   * Encrypt a message using a private key
   * @param message - The message to encrypt
   * @param privateKey - The private key to use for encryption
   * @returns Object containing encrypted data and nonce
   */
  static encrypt(message: string, privateKey: `0x${string}`): {
    encryptedData: string,
    nonce: string
  } {
    // Generate a random nonce for this encryption
    const nonce = generatePrivateKey()

    // Create encryption key from private key + nonce using keccak256
    const keyMaterial = keccak256(toHex(privateKey + nonce.slice(2)))
    const key = fromHex(keyMaterial, 'bytes')

    // Convert message to bytes
    const messageBytes = new TextEncoder().encode(message)

    // XOR encryption
    const encrypted = new Uint8Array(messageBytes.length)
    for (let i = 0; i < messageBytes.length; i++) {
      encrypted[i] = messageBytes[i] ^ key[i % key.length]
    }

    return {
      encryptedData: bytesToHex(encrypted),
      nonce
    }
  }

  /**
   * Decrypt a message using a private key
   * @param encryptedData - The encrypted data (hex string)
   * @param nonce - The nonce used during encryption
   * @param privateKey - The private key to use for decryption
   * @returns The decrypted message
   */
  static decrypt(encryptedData: string, nonce: string, privateKey: `0x${string}`): string {
    // Recreate the encryption key using the same private key + nonce
    const keyMaterial = keccak256(toHex(privateKey + nonce.slice(2)))
    const key = fromHex(keyMaterial, 'bytes')

    // Convert encrypted data back to bytes
    const encryptedBytes = hexToBytes(encryptedData as `0x${string}`)

    // XOR decryption (same operation as encryption)
    const decrypted = new Uint8Array(encryptedBytes.length)
    for (let i = 0; i < encryptedBytes.length; i++) {
      decrypted[i] = encryptedBytes[i] ^ key[i % key.length]
    }

    // Convert back to string
    return new TextDecoder().decode(decrypted)
  }

  /**
   * Encrypt a message for a specific account (using the account's private key)
   * @param message - The message to encrypt
   * @param accountPrivateKey - The account's private key
   * @returns Object containing encrypted data, nonce, and account address
   */
  static encryptForAccount(message: string, accountPrivateKey: `0x${string}`) {
    const address = privateKeyToAddress(accountPrivateKey)
    const encrypted = this.encrypt(message, accountPrivateKey)

    return {
      ...encrypted,
      accountAddress: address
    }
  }

  /**
   * Decrypt a message for a specific account
   * @param encryptedData - The encrypted data
   * @param nonce - The nonce used during encryption
   * @param accountPrivateKey - The account's private key
   * @returns The decrypted message
   */
  static decryptForAccount(
    encryptedData: string,
    nonce: string,
    accountPrivateKey: `0x${string}`
  ): string {
    return this.decrypt(encryptedData, nonce, accountPrivateKey)
  }
}

/**
 * Quick usage example
 */
export function quickExample() {
  console.log('=== Quick Example ===\n')

  // Generate a private key (or use your existing one)
  const myPrivateKey = generatePrivateKey()
  const myAddress = privateKeyToAddress(myPrivateKey)

  console.log('My Address:', myAddress)

  // Encrypt a message
  const message = "Hello World! This is my secret."
  const encrypted = SimpleViemEncryption.encrypt(message, myPrivateKey)

  console.log('Original:', message)
  console.log('Encrypted:', encrypted.encryptedData.slice(0, 30) + '...')

  // Decrypt the message
  const decrypted = SimpleViemEncryption.decrypt(
    encrypted.encryptedData,
    encrypted.nonce,
    myPrivateKey
  )

  console.log('Decrypted:', decrypted)
  console.log('Success:', message === decrypted)

  return { message, encrypted, decrypted, success: message === decrypted }
}
