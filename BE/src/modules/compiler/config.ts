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
		// --- Process & Execution ---
		/system\s*\(/gi,
		/exec[lv][pe]?\s*\(/gi, // execl, execle, execlp, execv, execve, execvp
		/popen\s*\(/gi,
		/fork\s*\(/gi,
		/vfork\s*\(/gi,
		/clone\s*\(/gi,
		/wait\s*\(/gi,
		/waitpid\s*\(/gi,

		// --- File System & IO ---
		/fopen\s*\(/gi,
		/freopen\s*\(/gi,
		/open\s*\(/gi,
		/openat\s*\(/gi,
		/unlink\s*\(/gi,
		/remove\s*\(/gi,
		/rename\s*\(/gi,
		/mkdir\s*\(/gi,
		/rmdir\s*\(/gi,
		/opendir\s*\(/gi,
		/readdir\s*\(/gi,
		/chown\s*\(/gi,
		/chmod\s*\(/gi,
		/symlink\s*\(/gi,
		/link\s*\(/gi,
		/std::fstream/gi,
		/std::ifstream/gi,
		/std::ofstream/gi,

		// --- Network ---
		/socket\s*\(/gi,
		/connect\s*\(/gi,
		/bind\s*\(/gi,
		/listen\s*\(/gi,
		/accept\s*\(/gi,
		/gethostbyname\s*\(/gi,
		/getaddrinfo\s*\(/gi,

		// --- Memory & Signals ---
		/#include\s*<sys\/ptrace\.h>/gi,
		/#include\s*<sys\/mman\.h>/gi,
		/#include\s*<sys\/shm\.h>/gi,
		/#include\s*<dlfcn\.h>/gi,
		/ptrace\s*\(/gi,
		/mmap\s*\(/gi,
		/shmget\s*\(/gi,
		/dlopen\s*\(/gi,
		/kill\s*\(/gi,
		/raise\s*\(/gi,
		/signal\s*\(/gi,

		// --- Assembly / Low level ---
		/__asm__/gi,
		/asm\s+volatile/gi,
		/__asm\s+/gi,

		// --- Environment / User ---
		/getenv\s*\(/gi, // Đôi khi cần chặn để không đọc biến môi trường server
		/setenv\s*\(/gi,
		/setuid\s*\(/gi,
		/setgid\s*\(/gi,

		// --- Includes nguy hiểm ---
		/#include\s*<unistd\.h>/gi, // Chứa hầu hết các syscall nguy hiểm (read, write, fork...)
		/#include\s*<windows\.h>/gi // Nếu server chạy windows
	]

	// File extension validation
	static readonly ALLOWED_EXTENSIONS = ['c'] as const

	// Maximum number of concurrent compilations
	static readonly MAX_CONCURRENT_COMPILATIONS = 40 // Across all containers - ~8 per container max

	// Security profiles
	static readonly SECCOMP_PROFILE_PATH =
		'./src/modules/compiler/seccomp.profile.json'
	static readonly RUN_USER = 'nobody' // Run code with low-privilege user
}
