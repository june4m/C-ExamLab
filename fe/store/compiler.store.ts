import { create } from "zustand"

interface CompilerState {
  code: string
  output: string
  error: string
  isLoading: boolean
  setCode: (code: string) => void
  setOutput: (output: string) => void
  setError: (error: string) => void
  setIsLoading: (isLoading: boolean) => void
  reset: () => void
}

const DEFAULT_CODE = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`

export const useCompilerStore = create<CompilerState>((set) => ({
  code: DEFAULT_CODE,
  output: "",
  error: "",
  isLoading: false,
  setCode: (code) => set({ code }),
  setOutput: (output) => set({ output, error: "" }),
  setError: (error) => set({ error, output: "" }),
  setIsLoading: (isLoading) => set({ isLoading }),
  reset: () =>
    set({
      code: DEFAULT_CODE,
      output: "",
      error: "",
      isLoading: false,
    }),
}))

