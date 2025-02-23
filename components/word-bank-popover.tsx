"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus } from "lucide-react"

interface WordBankPopoverProps {
  word: string
  position: { x: number; y: number }
  onClose: () => void
}

export function WordBankPopover({ word, position, onClose }: WordBankPopoverProps) {
  const addToWordBank = async () => {
    try {
      const response = await fetch("/api/word-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      })
      if (response.ok) {
        onClose()
      }
    } catch (error) {
      console.error("Error adding word to bank:", error)
    }
  }

  return (
    <div
      className="absolute z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="secondary" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add to Word Bank
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <h4 className="font-medium">Add "{word}" to Word Bank?</h4>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={addToWordBank}>
                Add Word
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

