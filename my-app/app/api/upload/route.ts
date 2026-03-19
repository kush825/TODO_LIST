import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const formData = await req.formData()
        const file = formData.get('file') as File
        if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'backgrounds')
        await mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const filename = `bg-${session.userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        // Return public URL
        const publicPath = `/uploads/backgrounds/${filename}`

        return NextResponse.json({ success: true, url: publicPath })
    } catch (error) {
        console.error("Upload error", error)
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }
}
