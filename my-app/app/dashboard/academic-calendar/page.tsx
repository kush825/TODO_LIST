import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AcademicCalendarClient from "./AcademicCalendarClient";
import fs from 'fs/promises';
import path from 'path';

export default async function AcademicCalendarPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    let events: any[] = [];
    try {
        const data = await fs.readFile('C:/tmp/sample_academic_events.json', 'utf8');
        events = JSON.parse(data);
    } catch (error) {
        console.error("Error reading academic events:", error);
    }

    return <AcademicCalendarClient events={events} />;
}
