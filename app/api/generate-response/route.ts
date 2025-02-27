import { NextResponse } from "next/server";

// Add this helper function at the top of the file
const getVoiceForLanguage = (language: string) => {
    // Match voices to languages for a more natural experience
    switch(language.toLowerCase()) {
        case 'french':
            return 'alloy'; // Choose the voice that sounds best for French
        case 'spanish':
            return 'nova';
        case 'german':
            return 'echo';
        case 'italian':
            return 'shimmer';
        case 'japanese':
            return 'nova';
        default:
            return 'nova'; // Default voice
    }
};

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

        // First call OpenAI API for text response
        const textResponse = await fetch("https://api.openai.com/v1/chat/completions", {
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

        const textData = await textResponse.json();
        const reply = textData.choices[0].message.content;

        // Now convert this text to speech using OpenAI's TTS API
        const speechResponse = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "tts-1", // or "tts-1-hd" for higher quality
                voice: getVoiceForLanguage(language),
                input: reply,
            }),
        });

        // Check if the speech generation was successful
        if (!speechResponse.ok) {
            const errorData = await speechResponse.json();
            console.error("TTS API error:", errorData);
            // Return just the text if speech fails
            return NextResponse.json({ reply, audioUrl: null });
        }

        // Convert the audio response to a buffer
        const audioBuffer = await speechResponse.arrayBuffer();
        
        // Convert buffer to base64 for easy transmission to the client
        const audioBase64 = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({ 
            reply, 
            audioData: audioBase64 
        });

    } catch (error) {
        console.error("Error generating AI response:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}