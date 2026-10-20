/**
 * Schedule a post into the next free posting slot of an account.
 *   SOCIAHIVE_API_KEY=sk_... npx tsx examples/next-slot.ts
 */
import { SociaHive, SociaHiveError } from '@sociahive/sdk'

const sh = new SociaHive({ apiKey: process.env.SOCIAHIVE_API_KEY! })

async function main() {
  const { data: accounts } = await sh.accounts.list()
  const account = accounts[0]
  if (!account) throw new Error('Connect an account first')
  try {
    const slot = await sh.postingSlots.findSlot({ accountIds: [account.id] })
    const post = await sh.posts.create({
      text: 'New arrivals are in',
      platforms: [{ platform: account.platform, account_id: account.id }],
      schedule_type: 'scheduled',
      scheduled_at: slot.at,
      timezone: slot.timezone,
    })
    console.log(`Scheduled ${post.id} for ${slot.at}`)
  } catch (err) {
    if (err instanceof SociaHiveError && err.code === 'no_slots') {
      console.log('Add a posting slot first: sh.postingSlots.create(...)')
      return
    }
    throw err
  }
}

main()
