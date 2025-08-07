import { Hono } from 'hono'
import { Resend } from 'resend'
import dotenv from 'dotenv'
import { createPublicClient, erc721Abi, http, parseEventLogs, recoverPublicKey, zeroAddress } from 'viem'

import { toViemAccount, } from '@phala/dstack-sdk/viem';
import { quickExample, SimpleViemEncryption, } from './encryption.js';
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

function privateKeyFromDeriveKeyResponse(keyResponse: any) {
  // Keep legacy behavior for GetTlsKeyResponse, but with warning.
  if (keyResponse.__name__ === 'GetTlsKeyResponse') {
    const hex = Array.from(keyResponse.asUint8Array(32)).map(b => b.toString(16).padStart(2, '0')).join('')
    return `0x${hex}`
  }
  const hex = Array.from(keyResponse.key).map((b: any) => b.toString(16).padStart(2, '0')).join('')
  return `0x${hex}`
}

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
  return c.json({ publicKey: account.address })
})
app.post('/encrypt', async (c) => {
  const { secret, nonce, txHash } = await c.req.json<{ secret: string, nonce: string, txHash: `0x${string}` }>()
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
  await redis.set(tokenId.toString(), JSON.stringify({ secret, nonce }))

  return c.json({ success: true })
})
app.post('/decrypt', async (c) => {
  const { txHash, publicKey } = await c.req.json<{ txHash: `0x${string}å`, publicKey: string }>()
  // const txReceipt = await chainClient.getTransactionReceipt({
  //   hash: txHash
  // })
  // const logs = parseEventLogs({
  //   abi: erc721Abi,
  //   logs: txReceipt.logs,
  //   eventName: "Transfer"
  // })
  // const mintLog = logs.find(log => log.args.to === zeroAddress)
  // const tokenId = Number(mintLog?.args.tokenId)
  // const data = await redis.get(BigInt("72665380454419391581355400232069437159262014028121481654220799702730424182663").toString()) as string
  // const { secret, nonce } = JSON.parse(data)
  console.log(SimpleViemEncryption.decrypt("0xd22ffad4967f2d1ce0bc2a5c6adde6accf863707dd41f878cd0e466d1fca4bf6c023f7d19f313758b9b473502cf0a7a6efc77448d915f42d9c51094d499e5feed470abfeb8033d48b8f428712f8da48198906b5ecd54fa76c258486005cb0b", "0xef751065ec7c84ebde3d536de7b23081f6ca3f771d9454b483834c47739da688", privateKeyFromDeriveKeyResponse(keyResult) as `0x${string}`), "DECRYPTION ENCRYPTION")
  const encryptedEmail = SimpleViemEncryption.encrypt(
    SimpleViemEncryption.decrypt("0xd22ffad4967f2d1ce0bc2a5c6adde6accf863707dd41f878cd0e466d1fca4bf6c023f7d19f313758b9b473502cf0a7a6efc77448d915f42d9c51094d499e5feed470abfeb8033d48b8f428712f8da48198906b5ecd54fa76c258486005cb0b", "0xef751065ec7c84ebde3d536de7b23081f6ca3f771d9454b483834c47739da688", privateKeyFromDeriveKeyResponse(keyResult) as `0x${string}`),
    publicKey as `0x${string}`)

  // await redis.del(tokenId.toString())

  return c.json({ encryptedData: encryptedEmail.encryptedData, nonce: encryptedEmail.nonce })
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
