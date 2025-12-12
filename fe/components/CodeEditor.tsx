"use client"

import { useState, useEffect, useRef } from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import type { editor } from "monaco-editor"
import { Card, CardContent } from "@/components/ui/card"

interface CodeEditorProps {
  value: string
  onChange: (value: string | undefined) => void
  height?: string
  errorLineNumber?: number
  errorColumnNumber?: number
  errorCode?: string
}

export function CodeEditor({
	value,
	onChange,
	height = "600px",
	errorLineNumber,
	errorColumnNumber,
	errorCode
}: CodeEditorProps) {
	const [isLoading, setIsLoading] = useState(true)
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)
	const monacoRef = useRef<Monaco | null>(null)
	const decorationsRef = useRef<string[]>([])

	const handleEditorDidMount = (
		editor: editor.IStandaloneCodeEditor,
		monaco: Monaco
	) => {
		editorRef.current = editor
		monacoRef.current = monaco
		setIsLoading(false)
	}

	// Highlight error line when errorLineNumber changes
	useEffect(() => {
		if (!editorRef.current || !monacoRef.current || !errorLineNumber) {
			// Clear decorations if no error
			if (editorRef.current && decorationsRef.current.length > 0) {
				editorRef.current.deltaDecorations(decorationsRef.current, [])
				decorationsRef.current = []
			}
			return
		}

		const editor = editorRef.current
		const monaco = monacoRef.current

		// Remove old decorations
		decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [])

		// Add new error decoration
		const lineNumber = errorLineNumber
		const columnNumber = errorColumnNumber || 1

		const decorations: editor.IModelDeltaDecoration[] = [
			{
				range: new monaco.Range(lineNumber, 1, lineNumber, 1),
				options: {
					isWholeLine: true,
					className: "error-line-highlight",
					glyphMarginClassName: "error-glyph-margin",
					hoverMessage: {
						value: errorCode
							? `**${errorCode.replace(/_/g, " ")}**\n\nLine ${lineNumber}${
									columnNumber ? `, Column ${columnNumber}` : ""
								}`
							: `Error at line ${lineNumber}`
					}
				}
			}
		]

		// Add column marker if columnNumber is provided
		if (columnNumber && columnNumber > 1) {
			decorations.push({
				range: new monaco.Range(
					lineNumber,
					columnNumber,
					lineNumber,
					columnNumber + 1
				),
				options: {
					className: "error-column-highlight",
					before: {
						content: "⚠",
						inlineClassName: "error-marker"
					}
				}
			})
		}

		decorationsRef.current = editor.deltaDecorations([], decorations)

		// Scroll to error line
		editor.revealLineInCenter(lineNumber)
	}, [errorLineNumber, errorColumnNumber, errorCode])

	return (
		<Card className="w-full">
			<CardContent className="p-0">
				<div className="relative">
					{isLoading && (
						<div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
							<div className="text-sm text-muted-foreground">
								Loading editor...
							</div>
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
						onMount={handleEditorDidMount}
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
							glyphMargin: true
						}}
					/>
				</div>
			</CardContent>
		</Card>
	)
}
