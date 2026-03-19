import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/actions/admin";

export async function GET() {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const userRoles = await prisma.userroles.findMany({
            include: {
                users: { select: { UserName: true, Email: true } },
                roles: true
            }
        });
        return NextResponse.json(userRoles);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch user roles" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { UserID, RoleID } = await req.json();
        const userRole = await prisma.userroles.create({
            data: { UserID, RoleID }
        });
        return NextResponse.json(userRole, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to assign role" }, { status: 500 });
    }
}
