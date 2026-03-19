import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { isAdmin } from "@/actions/admin";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await params;
        const body = await req.json();
        const commentId = parseInt(id);

        // Check ownership or admin
        const comment = await prisma.taskcomments.findUnique({
            where: { CommentID: commentId }
        });

        if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        if (comment.UserID !== session.userId && !await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const updatedComment = await prisma.taskcomments.update({
            where: { CommentID: commentId },
            data: { CommentText: body.CommentText }
        });

        return NextResponse.json(updatedComment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
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
        const commentId = parseInt(id);

        const comment = await prisma.taskcomments.findUnique({
            where: { CommentID: commentId }
        });

        if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        if (comment.UserID !== session.userId && !await isAdmin()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.taskcomments.delete({
            where: { CommentID: commentId }
        });

        return NextResponse.json({ message: "Comment deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}
