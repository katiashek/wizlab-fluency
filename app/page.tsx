import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Settings, Star, Timer } from "lucide-react"
import Image from "next/image"
import { SpeechInterface } from "@/components/speech-interface"
import { TaskTimer } from "@/components/task-timer"
import { WordBank } from "@/components/word-bank"

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/transparent%20background-wUN1v99pk1YbEP9aJaLUVD75F5RgQt.png"
              alt="WizLab Logo"
              width={100}
              height={40}
              className="dark:brightness-150"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="container py-6">
        <Tabs defaultValue="practice" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="practice">Practice</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="practice" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <Card className="p-6 space-y-6">
                <SpeechInterface />
              </Card>
              <div className="space-y-6">
                <Card className="p-6">
                  <TaskTimer />
                </Card>
                <Card className="p-6">
                  <WordBank />
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="p-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-semibold">Assigned Tasks</h3>
                    <p className="text-sm text-muted-foreground">
                      Complete these speaking exercises to improve your fluency
                    </p>
                  </div>
                </div>
                <div className="grid gap-4">
                  {[1, 2, 3].map((task) => (
                    <Card key={task} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h4 className="font-medium">Speaking Task {task}</h4>
                          <p className="text-sm text-muted-foreground">Describe your favorite place to visit</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Timer className="w-4 h-4" />
                            <span>3 minutes</span>
                          </div>
                        </div>
                        <Button size="icon" variant="secondary">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-semibold">Your Progress</h3>
                  <p className="text-sm text-muted-foreground">Track your speaking improvement over time</p>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Speaking Time</div>
                      <div className="text-2xl font-bold">2.5 hours</div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Tasks Completed</div>
                      <div className="text-2xl font-bold">12</div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Fluency Score</div>
                      <div className="flex items-center gap-1">
                        <div className="text-2xl font-bold">4.8</div>
                        <Star className="w-5 h-5 text-secondary fill-secondary" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

