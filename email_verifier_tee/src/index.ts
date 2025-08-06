import { Hono } from 'hono'
import { Resend } from 'resend'
import { env } from '../env.js'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
const app = new Hono()
const resend = new Resend(env.RESEND_API)
app.use('*', cors())
app.get('/ping', (c) => {
  return c.text('pong')
})
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/send-verification-email', async (c) => {
  const { signedMessage, email } = await c.req.json<{ signedMessage: string, email: string }>()
  await resend.emails.send({
    from: 'no-reply@trustprotocol.net',
    to: email,
    subject: 'Submit this email to verify',
    html: `Hash is ${signedMessage}`
  })
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: Number(env.PORT)
});
