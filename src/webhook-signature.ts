/**
 * Verify a SociaHive webhook delivery.
 *
 *   X-SociaHive-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">
 *
 * Uses Web Crypto (`globalThis.crypto.subtle`, Node 20+, Deno, Bun, edge
 * runtimes), so the SDK keeps zero dependencies.
 */

const DEFAULT_TOLERANCE_SEC = 300

export interface VerifyWebhookOptions {
  /** The raw request body, exactly as received. */
  body: string
  /** The `X-SociaHive-Signature` header. */
  signature: string | null | undefined
  /** The webhook's signing secret (returned once when the webhook was created). */
  secret: string
  /** Reject deliveries whose timestamp is further than this from now. Default 300 seconds. */
  toleranceSec?: number
  /** Current time in seconds; for tests. */
  nowSec?: number
}

export function parseSignatureHeader(header: string): { t: number; v1: string[] } | null {
  let t: number | null = null
  const v1: string[] = []
  for (const part of header.split(',')) {
    const eq = part.indexOf('=')
    if (eq < 0) continue
    const key = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (key === 't' && /^\d+$/.test(value)) t = Number(value)
    if (key === 'v1' && /^[0-9a-f]+$/i.test(value)) v1.push(value.toLowerCase())
  }
  return t === null || v1.length === 0 ? null : { t, v1 }
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) throw new Error('@sociahive/sdk: Web Crypto is not available in this runtime (Node 20+ required)')
  const enc = new TextEncoder()
  const key = await subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = new Uint8Array(await subtle.sign('HMAC', key, enc.encode(message)))
  return Array.from(sig, (b) => b.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** True when the signature matches the body and the timestamp is within tolerance. */
export async function verifyWebhookSignature(opts: VerifyWebhookOptions): Promise<boolean> {
  if (!opts.signature || !opts.secret) return false
  const parsed = parseSignatureHeader(opts.signature)
  if (!parsed) return false
  const now = opts.nowSec ?? Math.floor(Date.now() / 1000)
  if (Math.abs(now - parsed.t) > (opts.toleranceSec ?? DEFAULT_TOLERANCE_SEC)) return false
  const expected = await hmacHex(opts.secret, `${parsed.t}.${opts.body}`)
  return parsed.v1.some((candidate) => constantTimeEqual(candidate, expected))
}
