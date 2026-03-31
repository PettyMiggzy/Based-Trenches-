import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'node:crypto'

const s3 = new S3Client({
  endpoint: 'https://sfo3.digitaloceanspaces.com',
  region: 'sfo3',
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY || '',
    secretAccessKey: process.env.DO_SPACES_SECRET || '',
  },
  forcePathStyle: false,
})

const BUCKET = '317jarvis-317'
const CDN_BASE = process.env.DO_SPACES_CDN || `https://${BUCKET}.sfo3.digitaloceanspaces.com`

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Image file required' }, { status: 400 })
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 2MB' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/gif' ? 'gif' : 'jpg'
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 12)
    const key = `tokens/${hash}.${ext}`

    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    }))

    const url = `${CDN_BASE}/${key}`

    return NextResponse.json({ ok: true, url })
  } catch (err: any) {
    console.error('Upload failed:', err.message)
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
