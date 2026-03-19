import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { readdir } from 'fs/promises'
import { join } from 'path'

export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'backgrounds')

        // Check if directory exists
        try {
            await readdir(uploadDir)
        } catch (e) {
            return NextResponse.json({ uploads: [] })
        }

        const files = await readdir(uploadDir)

        // Filter files that belong to this user (bg-{userId}-...)
        const userFiles = files
            .filter(file => file.startsWith(`bg-${session.userId}-`))
            .map(file => `/uploads/backgrounds/${file}`)
            .reverse() // Newest first (if named with timestamp)

        return NextResponse.json({ uploads: userFiles })
    } catch (error) {
        console.error("Fetch uploads error", error)
        return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 })
    }
}
