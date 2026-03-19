import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    try {
        const comments = await prisma.taskcomments.findMany({
            where: taskId ? { TaskID: parseInt(taskId) } : {},
            include: {
                users: { select: { UserID: true, UserName: true, ProfileImage: true } }
            },
            orderBy: { CreatedAt: 'asc' }
        });
        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { TaskID, CommentText } = await req.json();

        if (!TaskID || !CommentText) {
            return NextResponse.json({ error: "TaskID and CommentText are required" }, { status: 400 });
        }

        const comment = await prisma.taskcomments.create({
            data: {
                TaskID,
                UserID: session.userId as number,
                CommentText
            },
            include: {
                users: { select: { UserName: true, ProfileImage: true } }
            }
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
    }
}
