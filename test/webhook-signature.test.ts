import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { parseSignatureHeader, verifyWebhookSignature } from '../src/webhook-signature'

const SECRET = 'a'.repeat(64)
const BODY = '{"id":"evt_1","event":"post.published","data":{}}'
const T = 1791532800

function sign(body: string, t: number, secret = SECRET): string {
  return `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${body}`).digest('hex')}`
}

describe('verifyWebhookSignature', () => {
  it('accepts a signature made the way the server signs', async () => {
    assert.equal(await verifyWebhookSignature({ body: BODY, signature: sign(BODY, T), secret: SECRET, nowSec: T + 10 }), true)
  })

  it('rejects a changed body, a wrong secret, or a missing header', async () => {
    assert.equal(await verifyWebhookSignature({ body: BODY + ' ', signature: sign(BODY, T), secret: SECRET, nowSec: T }), false)
    assert.equal(await verifyWebhookSignature({ body: BODY, signature: sign(BODY, T, 'b'.repeat(64)), secret: SECRET, nowSec: T }), false)
    assert.equal(await verifyWebhookSignature({ body: BODY, signature: undefined, secret: SECRET, nowSec: T }), false)
  })

  it('rejects a timestamp outside the tolerance (replay)', async () => {
    assert.equal(await verifyWebhookSignature({ body: BODY, signature: sign(BODY, T), secret: SECRET, nowSec: T + 301 }), false)
  })

  it('parses the header', () => {
    assert.deepEqual(parseSignatureHeader('t=5,v1=ABcd'), { t: 5, v1: ['abcd'] })
    assert.equal(parseSignatureHeader('v1=abcd'), null)
  })
})
