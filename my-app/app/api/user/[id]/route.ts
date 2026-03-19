import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/actions/admin";
import { getSession } from "@/lib/auth";
import bcrypt from 'bcryptjs'; // Added for PATCH function

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;

    // Users can see their own profile, Admins can see any
    if (!session || (session.userId !== parseInt(id) && !await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.users.findUnique({
            where: { UserID: parseInt(id) },
            select: {
                UserID: true,
                UserName: true,
                Email: true,
                CreatedAt: true,
                // @ts-ignore
                ProfileImage: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;

    if (!session || (session.userId !== parseInt(id) && !await isAdmin())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        // If password is changed, hash it
        if (body.PasswordHash) {
            body.PasswordHash = await bcrypt.hash(body.PasswordHash, 10);
        }

        const user = await prisma.users.update({
            where: { UserID: parseInt(id) },
            data: body
        });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const userId = parseInt(id);

        // Check if target is admin
        const targetUserRole = await prisma.userroles.findFirst({
            where: {
                UserID: userId,
                roles: { RoleName: 'Admin' }
            }
        });

        if (targetUserRole) {
            return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
        }

        await prisma.users.delete({
            where: { UserID: userId }
        });
        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}
