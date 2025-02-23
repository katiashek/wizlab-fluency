import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as Blob | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert Blob to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Save file to local storage (or upload to a cloud service)
    const filePath = path.join(process.cwd(), "public", "recordings", `${Date.now()}.wav`);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ message: "File saved successfully!", filePath });
  } catch (error) {
    console.error("Error saving file:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

