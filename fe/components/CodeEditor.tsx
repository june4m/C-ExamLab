"use client"

import { useState } from "react"
import Editor from "@monaco-editor/react"
import { Card, CardContent } from "@/components/ui/card"

interface CodeEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  height?: string
}

export function CodeEditor({ value, onChange, height = "600px" }: CodeEditorProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <div className="text-sm text-muted-foreground">Loading editor...</div>
            </div>
          )}
          <Editor
            height={height}
            defaultLanguage="c"
            language="c"
            theme="vs-dark"
            value={value}
            onChange={(val) => {
              onChange(val)
            }}
            onMount={() => setIsLoading(false)}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

