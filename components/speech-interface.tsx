interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

"use client"

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, MicOff, Download } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { WordBankPopover } from "./word-bank-popover"

export function SpeechInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [selectedText, setSelectedText] = useState("")
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 })
  const [showPopover, setShowPopover] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const generateAIResponse = async (newTranscript: string) => {
    try {
        const response = await fetch("/api/generate-response", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: newTranscript }),
        });

        const data = await response.json();
        if (data.reply) {
            setAiResponse(data.reply);
            setTranscript((prev) => prev + `\n\n🧠 AI: ${data.reply}`);
        }
    } catch (error) {
        console.error("Error generating AI response:", error);
    }
};


  const toggleRecording = () => {
    if (!isRecording) {
      // Create a new SpeechRecognition instance
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "auto"; // Auto-detect language
      recognition.continuous = true; // Keep listening continuously
      recognition.interimResults = true; // Show words as they are spoken
  
      let silenceTimer: NodeJS.Timeout;
  
      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        let newTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += event.results[i][0].transcript + " ";
        }
        setTranscript(newTranscript);
  
        clearTimeout(silenceTimer);
  
        // After 3 seconds of silence, send transcript to AI
        silenceTimer = setTimeout(() => {
          generateAIResponse(newTranscript);
        }, 3000);
      };
  
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
      };
  
      recognition.start();
      recognitionRef.current = recognition; // ✅ Store recognition in ref
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop(); // ✅ Ensure it only stops if valid
        recognitionRef.current = null; // Clear the reference after stopping
      }
    }
    setIsRecording(!isRecording);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      setSelectedText(selection.toString())
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      })
      setShowPopover(true)
    } else {
      setShowPopover(false)
    }
  }

  const exportTranscript = () => {
    const element = document.createElement("a")
    const file = new Blob([transcript + "\n\nAI Response:\n" + aiResponse], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "speaking-session.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Speaking Practice</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" onClick={exportTranscript}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-4 min-h-[300px] relative" onMouseUp={handleTextSelection}>
        <div className="space-y-4">
          {transcript && <p className="leading-relaxed text-foreground">{transcript}</p>}
          {aiResponse && <p className="leading-relaxed text-primary italic">🧠 AI: {aiResponse}</p>}
          {!transcript && !aiResponse && (
            <p className="text-muted-foreground">
              {isRecording ? "Listening... Start speaking" : "Press the microphone button to start speaking"}
            </p>
          )}
        </div>

        {showPopover && (
          <WordBankPopover word={selectedText} position={popoverPosition} onClose={() => setShowPopover(false)} />
        )}
      </Card>

      <Button
        onClick={toggleRecording}
        className="w-full flex items-center justify-center"
        variant={isRecording ? "destructive" : "default"}
      >
        {isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
        {isRecording ? "Stop Recording" : "Start Speaking"}
      </Button>
    </div>
  )
}
