/**
 * Compiler Service Configuration
 * Centralized configuration for security limits, timeouts, and Docker settings
 */

export class CompilerConfig {
	// Code size limits
	static readonly MAX_CODE_SIZE = 1024 * 1024 // 1MB
	static readonly MIN_CODE_SIZE = 1 // Minimum 1 byte

	// Test case limits
	static readonly MAX_TEST_CASES = 100
	static readonly MAX_TEST_CASE_INPUT_SIZE = 10 * 1024 // 10KB per input
	static readonly MAX_TEST_CASE_OUTPUT_SIZE = 10 * 1024 // 10KB per output

	// Output size limits (to prevent memory exhaustion)
	static readonly MAX_OUTPUT_SIZE = 1024 * 1024 // 1MB
	static readonly MAX_ERROR_OUTPUT_SIZE = 512 * 1024 // 512KB

	// Execution timeouts
	static readonly DEFAULT_TIMEOUT = 5000 // 5 seconds
	static readonly MAX_TIMEOUT = 30000 // 30 seconds
	static readonly MIN_TIMEOUT = 100 // 100ms
	static readonly DOCKER_EXEC_TIMEOUT_BUFFER = 5000 // Extra 5s for Docker overhead
	static readonly CLEANUP_TIMEOUT = 2000 // 2s for cleanup operations

	// Rate limiting
	static readonly MAX_REQUESTS_PER_MINUTE = 1000 // Increased for stress testing
	static readonly RATE_LIMIT_WINDOW_MS = 60000 // 1 minute

	// Docker container settings
	static readonly CONTAINER_NAME_PREFIX = 'c_compiler'
	static readonly CONTAINER_POOL_SIZE = 5 // Number of containers
	static readonly CONTAINER_CPUS = '2' // Per container
	static readonly CONTAINER_MEMORY_MB = 512 // Per container
	static readonly CONTAINER_PIDS_LIMIT = 300 // Per container - GCC needs ~10-15 PIDs per compilation

	// Compilation markers
	static readonly COMPILE_SUCCESS_MARKER = '___COMPILE_SUCCESS___'
	static readonly COMPILE_ERROR_MARKER = 'error:'

	// Security: Dangerous patterns to check in code
	static readonly DANGEROUS_PATTERNS = [
		/system\s*\(/gi,
		/exec[lv][pe]?\s*\(/gi,
		/popen\s*\(/gi,
		/fork\s*\(/gi,
		/clone\s*\(/gi,
		/#include\s*<sys\/ptrace\.h>/gi,
		/__asm__/gi,
		/asm\s+volatile/gi
	]

	// File extension validation
	static readonly ALLOWED_EXTENSIONS = ['c'] as const

	// Maximum number of concurrent compilations
	static readonly MAX_CONCURRENT_COMPILATIONS = 40 // Across all containers - ~8 per container max
}
