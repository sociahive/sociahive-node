/**
 * Send a draft to a client for review, check clicks on its links, and arm a
 * plug that reposts it on X at 100 likes. Arming a plug acts on a real
 * audience when it fires.
 *   SOCIAHIVE_API_KEY=sk_... npx tsx examples/review-and-plug.ts <postId> <xAccountId>
 */
import { SociaHive } from '@sociahive/sdk'

const sh = new SociaHive({ apiKey: process.env.SOCIAHIVE_API_KEY! })

async function main(postId: string, xAccountId: string) {
  const link = await sh.reviewLinks.create(postId, { reviewer_name: 'Client' })
  console.log('Send this to your client (shown once):', link.url)

  const review = await sh.reviewLinks.list(postId)
  console.log('Latest decision:', review.latest_decision?.kind ?? 'none yet')

  const clicks = await sh.linkClicks.get(postId)
  for (const l of clicks.links) console.log(l.destination_url, l.total)

  const plug = await sh.plugs.arm(postId, {
    account_id: xAccountId,
    trigger: { metric: 'likes', threshold: 100 },
    action: { kind: 'repost' },
  })
  console.log('Plug armed:', plug.id)
}

main(process.argv[2]!, process.argv[3]!)
