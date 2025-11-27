"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Terminal, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OutputPanelProps {
  output: string
  error: string
  isLoading?: boolean
}

export function OutputPanel({ output, error, isLoading }: OutputPanelProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Output</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="output" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="output">
              <Terminal className="mr-2 h-4 w-4" />
              Output
            </TabsTrigger>
            <TabsTrigger value="errors">
              <AlertCircle className="mr-2 h-4 w-4" />
              Errors
            </TabsTrigger>
          </TabsList>
          <TabsContent value="output" className="mt-4">
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-md">
                  <div className="text-sm text-muted-foreground">Compiling...</div>
                </div>
              )}
              <pre
                className={cn(
                  "min-h-[200px] w-full rounded-md bg-muted p-4 font-mono text-sm overflow-auto",
                  !output && "text-muted-foreground"
                )}
              >
                {output || "No output yet. Compile and run your code to see the output here."}
              </pre>
            </div>
          </TabsContent>
          <TabsContent value="errors" className="mt-4">
            <pre
              className={cn(
                "min-h-[200px] w-full rounded-md bg-muted p-4 font-mono text-sm overflow-auto",
                error ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {error || "No errors. Your code compiled successfully!"}
            </pre>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

