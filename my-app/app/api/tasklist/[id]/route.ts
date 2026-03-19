import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tasklist = await prisma.tasklists.findUnique({
            where: { ListID: parseInt(id) },
            include: {
                tasks: true
            }
        });

        if (!tasklist) {
            return NextResponse.json({ error: "Task list not found" }, { status: 404 });
        }

        return NextResponse.json(tasklist);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch task list" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const tasklist = await prisma.tasklists.update({
            where: { ListID: parseInt(id) },
            data: body
        });
        return NextResponse.json(tasklist);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update task list" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.tasklists.delete({
            where: { ListID: parseInt(id) }
        });
        return NextResponse.json({ message: "Task list deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task list" }, { status: 500 });
    }
}
