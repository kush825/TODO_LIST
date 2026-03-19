import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
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

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
        await mkdir(uploadDir, { recursive: true })

        const filename = `${session.userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)
        const publicPath = `/uploads/profiles/${filename}`

        await prisma.users.update({
            where: { UserID: session.userId as number },
            // @ts-ignore
            data: { ProfileImage: publicPath }
        })

        return NextResponse.json({ success: true, imagePath: publicPath })
    } catch (error) {
        console.error("Upload error", error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        await prisma.users.update({
            where: { UserID: session.userId as number },
            // @ts-ignore
            data: { ProfileImage: null }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error", error)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
