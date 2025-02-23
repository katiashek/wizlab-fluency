"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Bookmark, Download, Trash } from "lucide-react"
import { useState } from "react"

interface Word {
  word: string
  translation: string
  explanation: string
}

export function WordBank() {
  const [words, setWords] = useState<Word[]>([
    {
      word: "Fluency",
      translation: "流暢さ",
      explanation: "The ability to speak smoothly and easily",
    },
    {
      word: "Practice",
      translation: "練習",
      explanation: "Repeated exercise to improve a skill",
    },
  ])

  const exportWordBank = (format: "csv" | "pdf") => {
    if (format === "csv") {
      const csv = [
        ["Word", "Translation", "Explanation"],
        ...words.map((word) => [word.word, word.translation, word.explanation]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      const element = document.createElement("a")
      const file = new Blob([csv], { type: "text/csv" })
      element.href = URL.createObjectURL(file)
      element.download = "word-bank.csv"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
    // PDF export would be implemented here
  }

  const removeWord = (wordToRemove: string) => {
    setWords(words.filter((w) => w.word !== wordToRemove))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Word Bank</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => exportWordBank("csv")}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {words.map((item) => (
          <Card key={item.word} className="p-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="font-medium">{item.word}</div>
                <div className="text-sm text-muted-foreground">{item.translation}</div>
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
        ))}
      </div>
    </div>
  )
}

