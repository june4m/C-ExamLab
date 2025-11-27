"use client"

import { CodeEditor } from "@/components/CodeEditor"
import { OutputPanel } from "@/components/OutputPanel"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Play, Download, Upload, RotateCcw } from "lucide-react"
import { useCompilerStore } from "@/store"

export default function Home() {
  const { code, output, error, isLoading, setCode, reset } = useCompilerStore()

  const handleCompile = () => {
    // TODO: Add compile service integration
    console.log("Compile functionality to be implemented")
  }

  const handleReset = () => {
    reset()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCode(content)
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "main.c"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='container mx-auto p-4 md:p-6 lg:p-8'>
        <div className='mb-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-2xl'>C Compiler Hub</CardTitle>
              <CardDescription>
                Write, compile, and test your C code online
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className='mb-4 flex flex-wrap gap-2'>
          <Button onClick={handleCompile} disabled={isLoading}>
            <Play className='mr-2 h-4 w-4' />
            {isLoading ? "Compiling..." : "Compile & Run"}
          </Button>
          <Button variant='outline' onClick={handleReset}>
            <RotateCcw className='mr-2 h-4 w-4' />
            Reset
          </Button>
          <Button variant='outline' onClick={handleDownload}>
            <Download className='mr-2 h-4 w-4' />
            Download
          </Button>
          <label>
            <Button variant='outline' asChild>
              <span>
                <Upload className='mr-2 h-4 w-4' />
                Upload
              </span>
            </Button>
            <input
              type='file'
              accept='.c,.h'
              onChange={handleFileUpload}
              className='hidden'
            />
          </label>
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-4'>
            <CodeEditor
              value={code}
              onChange={(value) => setCode(value || "")}
              height='600px'
            />
          </div>
          <div className='space-y-4'>
            <OutputPanel output={output} error={error} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}
