import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { transcript, language } = await req.json();

        if (!transcript) {
            return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
        }

        const API_KEY = process.env.OPENAI_API_KEY;
        if (!API_KEY) {
            return NextResponse.json({ error: "API key missing" }, { status: 500 });
        }

        // Call OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [{ role: "system", content: `You are a helpful assistant who responds in ${language}.` },
                           { role: "user", content: transcript }],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        return NextResponse.json({ reply: data.choices[0].message.content });

    } catch (error) {
        console.error("Error generating AI response:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

