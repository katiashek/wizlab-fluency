"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Bookmark, Download, Trash } from "lucide-react";
import { useState, useEffect } from "react";

interface Word {
  word: string;
  translation: string;
  explanation: string;
}

export function WordBank() {
  const [words, setWords] = useState<Word[]>([]);

  // Load stored words from localStorage when the component mounts
  useEffect(() => {
    const storedWords = localStorage.getItem("wordBank");
    if (storedWords) {
      setWords(JSON.parse(storedWords));
    }
  }, []);

  // Save words to localStorage whenever the list updates
  useEffect(() => {
    localStorage.setItem("wordBank", JSON.stringify(words));
  }, [words]);

  const addWord = () => {
    const newWord = prompt("Enter the new word:");
    const translation = prompt("Enter the translation:");
    const explanation = prompt("Enter the explanation:");

    if (newWord && translation && explanation) {
      const updatedWords = [...words, { word: newWord, translation, explanation }];
      setWords(updatedWords);
      localStorage.setItem("wordBank", JSON.stringify(updatedWords));
    }
  };

  const exportWordBank = (format: "csv" | "pdf") => {
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
    } else if (format === "pdf") {
      // PDF export (needs third-party library like jsPDF)
      alert("PDF export functionality will be added soon.");
    }
  };

  const removeWord = (wordToRemove: string) => {
    const updatedWords = words.filter((w) => w.word !== wordToRemove);
    setWords(updatedWords);
    localStorage.setItem("wordBank", JSON.stringify(updatedWords));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Word Bank</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => exportWordBank("csv")}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={addWord}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {words.length === 0 ? (
          <p className="text-muted-foreground text-sm">No words saved yet. Click + to add words.</p>
        ) : (
          words.map((item) => (
            <Card key={item.word} className="p-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{item.word}</div>
                  <div className="text-sm text-muted-foreground">{item.translation}</div>
                  <div className="text-xs text-gray-500">{item.explanation}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeWord(item.word)}>
                    <Trash className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
