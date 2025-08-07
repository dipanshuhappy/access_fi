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
 * RSA Asymmetric encryption using Node.js crypto
 */
export class RSAAsymmetricEncryption {
  /**
   * Generate RSA key pair
   * @returns Object containing public and private keys in PEM format
   */
  static generateKeyPair(): { publicKey: string, privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Encrypt data using RSA public key
   * @param data - The data to encrypt
   * @param publicKey - The public key in PEM format
   * @returns Base64 encoded encrypted data
   */
  static encrypt(data: string, publicKey: string): string {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt({
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, buffer);

    return encrypted.toString('base64');
  }

  /**
   * Decrypt data using RSA private key
   * @param encryptedData - Base64 encoded encrypted data
   * @param privateKey - The private key in PEM format
   * @returns Decrypted string
   */
  static decrypt(encryptedData: string, privateKey: string): string {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    }, buffer);

    return decrypted.toString('utf8');
  }

  /**
   * Extract public key from private key
   * @param privateKey - The private key in PEM format
   * @returns Public key in PEM format
   */
  static getPublicKeyFromPrivate(privateKey: string): string {
    const keyObject = crypto.createPrivateKey(privateKey);
    return keyObject.export({
      type: 'spki',
      format: 'pem'
    }) as string;
  }
}

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
 * Quick usage example for RSA encryption
 */
export function quickRSAExample() {
  console.log('=== RSA Encryption Example ===\n')

  // Generate RSA key pair
  const { publicKey, privateKey } = RSAAsymmetricEncryption.generateKeyPair()

  console.log('Public Key:', publicKey.slice(0, 50) + '...')

  // Encrypt a message using public key
  const message = "Hello World! This is my secret message."
  const encrypted = RSAAsymmetricEncryption.encrypt(message, publicKey)

  console.log('Original:', message)
  console.log('Encrypted:', encrypted.slice(0, 50) + '...')

  // Decrypt the message using private key
  const decrypted = RSAAsymmetricEncryption.decrypt(encrypted, privateKey)

  console.log('Decrypted:', decrypted)
  console.log('Success:', message === decrypted)

  return { message, encrypted, decrypted, success: message === decrypted, publicKey, privateKey }
}

/**
 * Quick usage example for Viem encryption
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
