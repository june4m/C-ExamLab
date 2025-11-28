/**
 * Rate Limiting Utility
 * Implements per-identifier rate limiting to prevent service abuse
 */

import { CompilerConfig } from './config'

export class RateLimitError extends Error {
	constructor(message: string, public retryAfter: number) {
		super(message)
		this.name = 'RateLimitError'
	}
}

interface RateLimitEntry {
	count: number
	windowStart: number
}

/**
 * Rate limiter using sliding window algorithm
 */
export class RateLimiter {
	private requests = new Map<string, RateLimitEntry>()
	private cleanupInterval: NodeJS.Timeout | null = null

	constructor(
		private maxRequests: number = CompilerConfig.MAX_REQUESTS_PER_MINUTE,
		private windowMs: number = CompilerConfig.RATE_LIMIT_WINDOW_MS
	) {
		// Start cleanup interval to remove old entries
		this.startCleanup()
	}

	/**
	 * Check if request is allowed for the given identifier
	 * @param identifier - Unique identifier (e.g., userId, IP address)
	 * @throws RateLimitError if rate limit is exceeded
	 */
	checkLimit(identifier: string): void {
		if (!identifier) {
			throw new Error('Identifier is required for rate limiting')
		}

		const now = Date.now()
		const entry = this.requests.get(identifier)

		if (!entry) {
			// First request from this identifier
			this.requests.set(identifier, {
				count: 1,
				windowStart: now
			})
			return
		}

		// Check if we're still in the same window
		const windowElapsed = now - entry.windowStart

		if (windowElapsed >= this.windowMs) {
			// Window has passed, reset
			this.requests.set(identifier, {
				count: 1,
				windowStart: now
			})
			return
		}

		// Still in the same window, check count
		if (entry.count >= this.maxRequests) {
			const retryAfter = Math.ceil((this.windowMs - windowElapsed) / 1000)
			throw new RateLimitError(
				`Rate limit exceeded. Maximum ${this.maxRequests} requests per ${
					this.windowMs / 1000
				} seconds. Please try again in ${retryAfter} seconds.`,
				retryAfter
			)
		}

		// Increment count
		entry.count++
		this.requests.set(identifier, entry)
	}

	/**
	 * Get current request count for an identifier
	 */
	getRequestCount(identifier: string): number {
		const entry = this.requests.get(identifier)
		if (!entry) return 0

		const now = Date.now()
		const windowElapsed = now - entry.windowStart

		// If window has passed, count is 0
		if (windowElapsed >= this.windowMs) {
			return 0
		}

		return entry.count
	}

	/**
	 * Get remaining requests for an identifier
	 */
	getRemainingRequests(identifier: string): number {
		const currentCount = this.getRequestCount(identifier)
		return Math.max(0, this.maxRequests - currentCount)
	}

	/**
	 * Reset rate limit for an identifier
	 */
	reset(identifier: string): void {
		this.requests.delete(identifier)
	}

	/**
	 * Clear all rate limit data
	 */
	clear(): void {
		this.requests.clear()
	}

	/**
	 * Start cleanup interval to remove expired entries
	 */
	private startCleanup(): void {
		// Run cleanup every window period
		this.cleanupInterval = setInterval(() => {
			this.cleanup()
		}, this.windowMs)
	}

	/**
	 * Remove expired entries from the map
	 */
	private cleanup(): void {
		const now = Date.now()
		const entriesToDelete: string[] = []

		for (const [identifier, entry] of this.requests.entries()) {
			const windowElapsed = now - entry.windowStart
			if (windowElapsed >= this.windowMs) {
				entriesToDelete.push(identifier)
			}
		}

		for (const identifier of entriesToDelete) {
			this.requests.delete(identifier)
		}

		if (entriesToDelete.length > 0) {
			console.log(
				`[RateLimiter] Cleaned up ${entriesToDelete.length} expired entries`
			)
		}
	}

	/**
	 * Stop the cleanup interval
	 */
	destroy(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval)
			this.cleanupInterval = null
		}
		this.requests.clear()
	}

	/**
	 * Get statistics about current rate limiting state
	 */
	getStats(): {
		totalIdentifiers: number
		activeIdentifiers: number
		totalRequests: number
	} {
		const now = Date.now()
		let activeCount = 0
		let totalRequests = 0

		for (const [_, entry] of this.requests.entries()) {
			const windowElapsed = now - entry.windowStart
			if (windowElapsed < this.windowMs) {
				activeCount++
				totalRequests += entry.count
			}
		}

		return {
			totalIdentifiers: this.requests.size,
			activeIdentifiers: activeCount,
			totalRequests
		}
	}
}

/**
 * Singleton instance for the compiler service
 */
export const compilerRateLimiter = new RateLimiter()
