import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { word } = await req.json()

    // In a real application, save this to a database
    console.log("Adding word to bank:", word)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to add word" }, { status: 500 })
  }
}

