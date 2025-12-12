"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Terminal, FileText, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface OutputPanelProps {
	output: string
	error: string
	isLoading?: boolean
	errorCode?: string
	lineNumber?: number
	columnNumber?: number
	errorDetails?: string
}

export function OutputPanel({
	output,
	error,
	isLoading,
	errorCode,
	lineNumber,
	columnNumber,
	errorDetails
}: OutputPanelProps) {
	// Format error code for display
	const formatErrorCode = (code?: string) => {
		if (!code) return null
		return code.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
	}

	// Determine default tab based on error
	const defaultTab = error ? "errors" : "output"

	return (
		<Card className="w-full">
			<CardHeader className="pb-3">
				<CardTitle className="text-lg">Output</CardTitle>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue={defaultTab} className="w-full">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="output">
							<Terminal className="mr-2 h-4 w-4" />
							Output
						</TabsTrigger>
						<TabsTrigger value="errors">
							<AlertCircle className="mr-2 h-4 w-4" />
							Errors
							{error && (
								<Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
									!
								</Badge>
							)}
						</TabsTrigger>
					</TabsList>
					<TabsContent value="output" className="mt-4">
						<div className="relative">
							{isLoading && (
								<div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10 rounded-md">
									<div className="text-sm text-muted-foreground">
										Compiling...
									</div>
								</div>
							)}
							<pre
								className={cn(
									"min-h-[200px] w-full rounded-md bg-muted p-4 font-mono text-sm overflow-auto",
									!output && "text-muted-foreground"
								)}
							>
								{output ||
									"No output yet. Compile and run your code to see the output here."}
							</pre>
						</div>
					</TabsContent>
					<TabsContent value="errors" className="mt-4">
						{error ? (
							<div className="space-y-3">
								{/* Error Type Badge */}
								{errorCode && (
									<div className="flex items-center gap-2">
										<Badge variant="destructive" className="text-sm">
											{formatErrorCode(errorCode)}
										</Badge>
										{lineNumber && (
											<span className="text-sm text-muted-foreground">
												at line {lineNumber}
												{columnNumber && `, column ${columnNumber}`}
											</span>
										)}
									</div>
								)}

								{/* Error Message */}
								<div className="space-y-1">
									<div className="text-sm font-semibold text-destructive">
										Error:
									</div>
									<pre
										className={cn(
											"min-h-[100px] w-full rounded-md bg-muted p-4 font-mono text-sm overflow-auto text-destructive"
										)}
									>
										{error}
									</pre>
								</div>

								{/* Error Details */}
								{errorDetails && errorDetails !== error && (
									<div className="space-y-1">
										<div className="text-sm font-semibold text-muted-foreground">
											Details:
										</div>
										<pre
											className={cn(
												"min-h-[100px] w-full rounded-md bg-muted p-4 font-mono text-xs overflow-auto"
											)}
										>
											{errorDetails}
										</pre>
									</div>
								)}
							</div>
						) : (
							<pre
								className={cn(
									"min-h-[200px] w-full rounded-md bg-muted p-4 font-mono text-sm overflow-auto text-muted-foreground"
								)}
							>
								No errors. Your code compiled successfully!
							</pre>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	)
}
