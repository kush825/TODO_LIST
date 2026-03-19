import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/actions/admin";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const role = await prisma.roles.update({
            where: { RoleID: parseInt(id) },
            data: body
        });
        return NextResponse.json(role);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
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
        await prisma.roles.delete({
            where: { RoleID: parseInt(id) }
        });
        return NextResponse.json({ message: "Role deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
    }
}
