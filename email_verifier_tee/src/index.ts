import { Hono } from 'hono'
import { Resend } from 'resend'
import { env } from '../env'
import { cors } from 'hono/cors'
const app = new Hono()
const resend = new Resend(env.RESEND_API)
app.use('*', cors())
app.post('/send-verification-email', async (c) => {
  const { signedMessage, email } = await c.req.json<{ signedMessage: string, email: string }>()
  await resend.emails.send({
    from: 'auth@resend.com',
    to: email,
    subject: 'Submit this email to verify',
    html: `Hash is ${signedMessage}`
  })
  return c.text('Hello Hono!')
})

export default {
  port: env.PORT,
  fetch: app.fetch,
}
