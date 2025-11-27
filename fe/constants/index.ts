// API endpoints
export const API_ENDPOINTS = {
  COMPILE: "/api/compile",
  // Add more endpoints here
} as const

// Application constants
export const APP_CONFIG = {
  DEFAULT_CODE: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
  EDITOR_HEIGHT: "600px",
} as const

// Query keys for React Query
export const QUERY_KEYS = {
  COMPILE: (code: string) => ["compile", code] as const,
  // Add more query keys here
} as const

