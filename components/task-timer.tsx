"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Timer } from "lucide-react"
import { useState, useEffect } from "react"

export function TaskTimer() {
  const [showTimer, setShowTimer] = useState(true)
  const [time, setTime] = useState(180) // 3 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [inputMinutes, setInputMinutes] = useState("3")

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1)
      }, 1000)
    } else if (time === 0) {
      setIsActive(false)
    }

    return () => clearInterval(interval)
  }, [isActive, time])

  const toggleTimer = () => {
    setShowTimer(!showTimer)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleTimeClick = () => {
    if (!isActive) {
      setIsEditing(true)
    }
  }

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newTime = Math.max(0, Math.min(60, Number.parseInt(inputMinutes))) * 60
    setTime(newTime)
    setIsEditing(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Timer</h3>
        <Button variant="ghost" size="icon" onClick={toggleTimer}>
          {showTimer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
      {showTimer && (
        <div className="space-y-4">
          <div
            className="flex items-center justify-center gap-2 text-3xl font-bold cursor-pointer"
            onClick={handleTimeClick}
          >
            <Timer className="w-6 h-6" />
            {isEditing ? (
              <form onSubmit={handleTimeSubmit} className="flex items-center gap-2">
                <Input
                  type="number"
                  value={inputMinutes}
                  onChange={(e) => setInputMinutes(e.target.value)}
                  className="w-20 text-center text-xl"
                  min="1"
                  max="60"
                  autoFocus
                />
                <span className="text-sm">min</span>
              </form>
            ) : (
              <span>{formatTime(time)}</span>
            )}
          </div>
          <Button
            className="w-full"
            variant={isActive ? "destructive" : "default"}
            onClick={() => setIsActive(!isActive)}
            disabled={isEditing}
          >
            {isActive ? "Stop Timer" : "Start Timer"}
          </Button>
        </div>
      )}
    </div>
  )
}

