import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/actions/admin";

export async function GET() {
    try {
        const roles = await prisma.roles.findMany();
        return NextResponse.json(roles);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { RoleName } = await req.json();
        const role = await prisma.roles.create({
            data: { RoleName }
        });
        return NextResponse.json(role, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }
}
