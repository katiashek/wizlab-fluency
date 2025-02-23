import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), "public", "word-bank.json");

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "No words found" }, { status: 404 });
        }

        const words = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const csvContent = "Word\n" + words.map((word: string) => `"${word}"`).join("\n");
        const csvPath = path.join(process.cwd(), "public", "word-bank.csv");

        fs.writeFileSync(csvPath, csvContent);

        return NextResponse.json({ url: "/public/word-bank.csv" });
    } catch (error) {
        console.error("Error exporting word bank:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

