import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const project = await prisma.projects.findUnique({
            where: { ProjectID: parseInt(id) },
            include: {
                users: {
                    select: { UserName: true, Email: true }
                },
                tasklists: {
                    include: {
                        tasks: { include: { users: { select: { UserName: true, ProfileImage: true } } } }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        const body = await req.json();
        const project = await prisma.projects.update({
            where: { ProjectID: parseInt(id) },
            data: body
        });
        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        await prisma.projects.delete({
            where: { ProjectID: parseInt(id) }
        });
        return NextResponse.json({ message: "Project deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
