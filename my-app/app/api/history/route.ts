import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('taskId');

    try {
        const history = await prisma.taskhistory.findMany({
            where: taskId ? { TaskID: parseInt(taskId) } : {},
            include: {
                users: { select: { UserName: true } },
                tasks: { select: { Title: true } }
            },
            orderBy: { ChangeTime: 'desc' }
        });
        return NextResponse.json(history);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch task history" }, { status: 500 });
    }
}
