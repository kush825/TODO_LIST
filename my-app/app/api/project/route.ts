import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const projects = await prisma.projects.findMany({
            include: {
                users: {
                    select: {
                        UserName: true,
                        Email: true
                    }
                },
                _count: {
                    select: {
                        tasklists: true
                    }
                }
            },
            orderBy: { CreatedAt: 'desc' }
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || (session.role !== 'Admin' && session.role !== 'ProjectManager')) {
        return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    try {
        const { ProjectName, Description } = await req.json();

        if (!ProjectName) {
            return NextResponse.json({ error: "Project name is required" }, { status: 400 });
        }

        const project = await prisma.projects.create({
            data: {
                ProjectName,
                Description,
                CreatedBy: session.userId as number,
                tasklists: {
                    create: {
                        ListName: 'Default List'
                    }
                }
            },
            include: {
                tasklists: true
            }
        });

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
