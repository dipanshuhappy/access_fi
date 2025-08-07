import { Hono } from 'hono'
import { Resend } from 'resend'
import dotenv from 'dotenv'
import { createPublicClient, erc721Abi, http, parseEventLogs, recoverPublicKey, zeroAddress } from 'viem'

import { toViemAccount, } from '@phala/dstack-sdk/viem';
import { quickExample, SimpleViemEncryption, RSAAsymmetricEncryption } from './encryption.js';
import * as crypto from 'crypto';
dotenv.config()

// import { env } from '../env.js'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
const app = new Hono()
const resend = new Resend(process.env.RESEND_API)
import { Redis } from '@upstash/redis'
const redis = new Redis({
  url: 'https://wanted-pug-26674.upstash.io',
  token: process.env.REDIS_TOKEN
})

import { TappdClient } from '@phala/dstack-sdk';
import { horizenTestnet } from './chain.js';

const client = new TappdClient();

// Check if service is reachable (500ms timeout, never throws)
const isReachable = await client.isReachable();
console.log({ isReachable })


const keyResult = await client.deriveKey('no i am not happy')

const chainClient = createPublicClient({
  chain: horizenTestnet,
  transport: http(),
})

// Generate RSA key pair from the keyResult
const rsaKeyPair = RSAAsymmetricEncryption.generateKeyPair()

const account = toViemAccount(keyResult);

app.use('*', cors())
app.get('/ping', (c) => {
  return c.text('pong')
})
app.get('/quote', async (c) => {
  const a = await client.tdxQuote('', 'raw')

  return c.json({ quote: a.quote })
})
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})
app.get('/public-key', async (c) => {
  return c.json({
    publicKey: rsaKeyPair.publicKey,
  })
})
app.post('/encrypt', async (c) => {
  const { secret, txHash } = await c.req.json<{ secret: string, nonce: string, txHash: `0x${string}` }>()
  const txReceipt = await chainClient.getTransactionReceipt({
    hash: txHash
  })
  const logs = parseEventLogs({
    abi: erc721Abi,
    logs: txReceipt.logs,
    eventName: "Transfer"
  })
  const mintLog = logs.find(log => log.args.from === zeroAddress)
  const tokenId = Number(mintLog?.args.tokenId)
  await redis.set(tokenId.toString(), JSON.stringify({ secret }))

  return c.json({ success: true })
})
app.post('/decrypt', async (c) => {
  const { tokenId } = await c.req.json<{ tokenId: string }>()
  const storedData = await redis.get(tokenId.toString()) as string
  const { secret } = JSON.parse(storedData)

  try {
    const decryptedData = RSAAsymmetricEncryption.decrypt(secret, rsaKeyPair.privateKey)
    return c.json({ success: true, decryptedData })
  } catch (error) {
    return c.json({ success: false, error: 'Failed to decrypt data' }, 400)
  }
})
app.post('/test-encryption', async (c) => {
  const { message } = await c.req.json<{ message: string }>()

  try {
    // Encrypt the message using the public key
    const encryptedData = RSAAsymmetricEncryption.encrypt(message, rsaKeyPair.publicKey)

    // Decrypt it back to verify it works
    const decryptedData = RSAAsymmetricEncryption.decrypt(encryptedData, rsaKeyPair.privateKey)

    return c.json({
      success: true,
      original: message,
      encrypted: encryptedData,
      decrypted: decryptedData,
      verified: message === decryptedData
    })
  } catch (error) {
    return c.json({ success: false, error: 'Encryption test failed' }, 500)
  }
})
app.post('/send-verification-email', async (c) => {
  const { hash, signature, email } = await c.req.json<{ hash: `0x${string}`, signature: `0x${string}`, email: string }>()
  const publicKey = await recoverPublicKey({
    hash,
    signature
  })
  await resend.emails.send({
    from: 'no-reply@trustprotocol.net',
    to: email,
    subject: 'Submit this email to verify',
    html: `Hash is ${publicKey}`
  })
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT)
});
