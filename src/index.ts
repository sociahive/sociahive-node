/**
 * @sociahive/sdk: official Node.js client for the SociaHive API.
 *
 * Thin ergonomic wrapper over fetch. Types for request/response payloads can be
 * regenerated from the live OpenAPI spec with `npm run generate:types`.
 *
 * Quickstart:
 *
 *   import { SociaHive } from '@sociahive/sdk'
 *   const sh = new SociaHive({ apiKey: process.env.SOCIAHIVE_API_KEY! })
 *   const accounts = await sh.accounts.list()
 */

export { SociaHive } from './client'
export { SociaHiveError } from './errors'
export * from './types'
