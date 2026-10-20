/**
 * Upload a local image to the media library, then post it with alt text.
 *   SOCIAHIVE_API_KEY=sk_... npx tsx examples/upload-and-post.ts ./photo.jpg
 */
import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'
import { SociaHive } from '@sociahive/sdk'

const sh = new SociaHive({ apiKey: process.env.SOCIAHIVE_API_KEY! })

async function main(file: string) {
  const uploaded = await sh.media.upload({ data: await readFile(file), filename: basename(file), mimeType: 'image/jpeg' })
  const { data: accounts } = await sh.accounts.list('instagram')
  const ig = accounts[0]
  if (!ig) throw new Error('Connect an Instagram account first')
  const post = await sh.posts.create({
    text: 'Fresh from the studio',
    media: [{ type: 'image', url: uploaded.public_url }],
    platforms: [{ platform: 'instagram', account_id: ig.id }],
    schedule_type: 'immediate',
  })
  console.log(`Published ${post.id}`)
}

main(process.argv[2] ?? './photo.jpg')
