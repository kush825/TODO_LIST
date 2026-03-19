import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/actions/admin";

export async function GET() {
    // if (!await isAdmin()) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    try {
        const users = await prisma.users.findMany({
            select: {
                UserID: true,
                UserName: true,
                Email: true,
                CreatedAt: true,
                ProfileImage: true,
                userroles: {
                    include: {
                        roles: true
                    }
                }
            },
            orderBy: { CreatedAt: 'desc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // User creation might be handled by a separate register action, 
    // but if it's an admin creating a user:
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { UserName, Email, PasswordHash, ProfileImage } = await req.json();

        if (!UserName || !Email || !PasswordHash) {
            return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
        }

        const user = await prisma.users.create({
            data: {
                UserName,
                Email,
                PasswordHash, // Note: In a real app, hash this first if not already hashed
                ProfileImage
            }
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
