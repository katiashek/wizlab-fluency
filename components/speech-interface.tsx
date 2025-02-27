import { useAuth } from '@/components/auth-provider';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

"use client";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { WordBankPopover } from "./word-bank-popover";

export function SpeechInterface() {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [showPopover, setShowPopover] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // 🔥 Added Language Selection State
  const [nativeLanguage, setNativeLanguage] = useState("en"); // Default English
  const [practiceLanguage, setPracticeLanguage] = useState("fr"); // Default French

  // Add these new state variables with the existing ones
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const generateAIResponse = async (newTranscript: string) => {
    try {
      console.log("Sending transcript to AI:", newTranscript);

      const response = await fetch("/api/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transcript: newTranscript, 
          language: practiceLanguage 
        }),
      });

      const data = await response.json();
      if (data.reply) {
        setAiResponse(data.reply);
        
        // Handle audio data if present
        if (data.audioData) {
          const audioSrc = `data:audio/mp3;base64,${data.audioData}`;
          setAudioSource(audioSrc);
          
          if (audioRef.current) {
            audioRef.current.src = audioSrc;
            setTimeout(() => {
              audioRef.current?.play().catch(err => {
                console.error("Error playing audio:", err);
              });
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      console.log("Starting speech recognition...");
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "auto"; // Use selected practice language
      recognition.continuous = true;
      recognition.interimResults = true;

      let silenceTimer: NodeJS.Timeout;
      let audioChunks: Blob[] = [];

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            
            mediaRecorder.ondataavailable = (event) => {
              audioChunks.push(event.data);
            };
            
            // Store the mediaRecorder reference to stop it later
            setMediaRecorder(mediaRecorder);
          })
          .catch(error => {
            console.error("Error accessing microphone:", error);
          });
      }


      recognition.onresult = async (event: SpeechRecognitionEvent) => {
        let newTranscript = transcript;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          newTranscript += " " + event.results[i][0].transcript;
        }
        setTranscript(newTranscript.trim()); // 🔥 Keeps full history of conversation

        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(async () => {
          await generateAIResponse(newTranscript);
        }, 2000);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.start();
      recognitionRef.current = recognition;
  } else {
    // Stop recording
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      
      // Stop and save the audio recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        
        mediaRecorder.onstop = async () => {
          if (user) {
            try {
              // Combine audio chunks into a single blob
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              
              // Create a reference to Firebase Storage
              const storageRef = ref(storage, `recordings/${user.uid}/${Date.now()}.webm`);
              
              // Upload the audio
              const snapshot = await uploadBytes(storageRef, audioBlob);
              const downloadURL = await getDownloadURL(snapshot.ref);
              
              // Save recording metadata to Firestore
              await addDoc(collection(db, "recordings"), {
                userId: user.uid,
                transcript: transcript,
                audioUrl: downloadURL,
                aiResponse: aiResponse,
                createdAt: serverTimestamp(),
              });
              
              console.log("Recording saved to Firebase");
            } catch (error) {
              console.error("Error saving recording:", error);
            }
          } else {
            console.log("User not logged in, recording not saved");
          }
        };
      }
    }
  }
  setIsRecording(!isRecording);
};

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString());
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setShowPopover(true);
    } else {
      setShowPopover(false);
    }
  };

  const exportTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcript + "\n\nAI Response:\n" + aiResponse], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "speaking-session.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const finishSession = async () => {
    try {
        const response = await fetch("/api/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript, aiResponse }),
        });

        if (response.ok) {
            alert("Session saved successfully!");
            setTranscript(""); // Clear transcript after session
            setAiResponse(""); // Clear AI responses after session
        } else {
            console.error("Error saving session:", await response.json());
        }
    } catch (error) {
        console.error("Error finishing session:", error);
    }
};


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

      {/* 🔥 Language Selection UI */}
      <div className="flex gap-4">
        <div>
          <label className="block text-sm font-medium">Native Language</label>
          <select
            value={nativeLanguage}
            onChange={(e) => setNativeLanguage(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Practice Language</label>
          <select
            value={practiceLanguage}
            onChange={(e) => setPracticeLanguage(e.target.value)}
            className="border rounded-md p-2"
          >
            <option value="fr">French</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
      </div>

      {/* Add this audio element before the Card component */}
      <audio ref={audioRef} className="hidden" controls />

      <Card className="p-4 min-h-[300px] relative" onMouseUp={handleTextSelection}>
        <div className="space-y-4">
          {transcript && <p className="leading-relaxed text-foreground">{transcript}</p>}
          {aiResponse && (
            <div>
              <p className="leading-relaxed text-primary italic">🧠 AI: {aiResponse}</p>
              {audioSource && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => audioRef.current?.play()}
                >
                  <Mic className="mr-2 h-4 w-4" /> Replay Response
                </Button>
              )}
            </div>
          )}
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

      <Button 
        onClick={finishSession} 
        className="w-full mt-2 bg-green-500 text-white hover:bg-green-600"
      >
        Finish Session
      </Button>
    </div>
  );
}
