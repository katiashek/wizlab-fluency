import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { transcript } = await req.json();
        if (!transcript) {
            return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
        }

        const positives = transcript.length > 50 ? "Good fluency and natural speech!" : "Try speaking more.";
        const improvements = transcript.includes("um") ? "Reduce filler words." : "Keep up the smooth flow!";
        const vocabulary = transcript.split(" ").slice(0, 5);

        return NextResponse.json({
            summary: {
                positives,
                improvements,
                vocabulary,
            },
        });

    } catch (error) {
        console.error("Error generating fluency report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

