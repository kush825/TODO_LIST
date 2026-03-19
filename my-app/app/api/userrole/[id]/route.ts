import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/actions/admin";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id } = await params;
        await prisma.userroles.delete({
            where: { UserRoleID: parseInt(id) }
        });
        return NextResponse.json({ message: "User role assignment removed" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to remove user role" }, { status: 500 });
    }
}
