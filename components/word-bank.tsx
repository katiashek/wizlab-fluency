"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Bookmark, Download, Trash } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

interface Word {
  id: string;  // Add this for Firestore doc ID
  word: string;
  translation: string;
  explanation: string;
}

export function WordBank() {
  const [words, setWords] = useState<Word[]>([]);
  const { user } = useAuth();

  // Fetch the user's word bank from Firestore
  useEffect(() => {
    if (user) {
      const fetchWords = async () => {
        const wordsQuery = query(collection(db, "words"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(wordsQuery);
        
        const wordsList: Word[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          wordsList.push({
            id: doc.id,
            word: data.word,
            translation: data.translation,
            explanation: data.explanation
          });
        });
        
        setWords(wordsList);
      };
      
      fetchWords().catch(console.error);
    }
  }, [user]);

  const exportWordBank = async (format: "csv" | "pdf") => {
    if (format === "csv") {
      const csv = [
        ["Word", "Translation", "Explanation"],
        ...words.map((word) => [word.word, word.translation, word.explanation]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const element = document.createElement("a");
      const file = new Blob([csv], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      element.download = "word-bank.csv";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const addWord = async (newWord: Omit<Word, 'id'>) => {
    if (user) {
      try {
        const docRef = await addDoc(collection(db, "words"), {
          userId: user.uid,
          word: newWord.word,
          translation: newWord.translation,
          explanation: newWord.explanation,
          createdAt: serverTimestamp()
        });
        
        setWords([...words, { ...newWord, id: docRef.id }]);
      } catch (error) {
        console.error("Error adding word:", error);
      }
    }
  };

  const removeWord = async (wordId: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, "words", wordId));
        setWords(words.filter((w) => w.id !== wordId));
      } catch (error) {
        console.error("Error removing word:", error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Word Bank</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => exportWordBank("csv")}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => {
            // Show a modal or form to add a new word
            const word = prompt("Enter word:");
            const translation = prompt("Enter translation:");
            const explanation = prompt("Enter explanation:");
            
            if (word && translation && explanation) {
              addWord({ word, translation, explanation });
            }
          }}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {words.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-medium">{item.word}</div>
                <div className="text-sm text-muted-foreground">{item.translation}</div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeWord(item.id)}>
                  <Trash className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}