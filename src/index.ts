/**
 * @sociahive/sdk: official Node.js client for the SociaHive API.
 *
 * Thin ergonomic wrapper over fetch. Request and response types of the
 * scheduler resources are generated from SociaHive's OpenAPI spec and
 * exported as the `Api` namespace.
 *
 * Quickstart:
 *
 *   import { SociaHive } from '@sociahive/sdk'
 *   const sh = new SociaHive({ apiKey: process.env.SOCIAHIVE_API_KEY! })
 *   const accounts = await sh.accounts.list()
 */

export { SociaHive } from './client'
export type { SociaHiveOptions } from './client'
export { SociaHiveError } from './errors'
export { verifyWebhookSignature } from './webhook-signature'
export type { Transport, CallArgs } from './transport'
export type * as Api from './generated'
export * from './types'
