// Compile service interfaces

export interface CompileRequest {
  code: string
  language?: string
}

export interface CompileResponse {
  output?: string
  error?: string
  success: boolean
}

