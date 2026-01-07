import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import type { Logger } from 'drizzle-orm'
import { DATABASE_URL, NODE_ENV } from './env'
import * as schema from '../common/database/schema'

class DatabaseLogger implements Logger {
	logQuery(query: string, params: unknown[]): void {
		if (NODE_ENV === 'development') {
			if (params.length > 0) {
				console.log(`[DB Query] ${query} | Params: ${JSON.stringify(params)}`)
			} else {
				console.log(`[DB Query] ${query}`)
			}
		}
	}
}

// Create MySQL connection pool
// mysql2/promise createPool accepts a connection string directly
// Pool options can be added via query string in DATABASE_URL or use a config object
const pool = mysql.createPool(DATABASE_URL)

// Test connection on startup
pool
	.getConnection()
	.then(connection => {
		if (NODE_ENV === 'development') {
			console.log('[DB] Connection pool initialized successfully')
		}
		connection.release()
	})
	.catch(err => {
		console.error('[DB] Failed to initialize connection pool:', {
			code: (err as any).code,
			errno: (err as any).errno,
			sqlState: (err as any).sqlState,
			sqlMessage: (err as any).sqlMessage,
			message: (err as any).message
		})

		const error = err as any
		if (error.code === 'PROTOCOL_CONNECTION_LOST') {
			console.error('[DB] Database connection was closed.')
		} else if (error.code === 'ER_CON_COUNT_ERROR') {
			console.error('[DB] Database has too many connections.')
		} else if (error.code === 'ECONNREFUSED') {
			console.error('[DB] Database connection was refused.')
		} else if (error.code === 'ETIMEDOUT') {
			console.error('[DB] Database connection timed out.')
		}
	})

// Initialize Drizzle ORM with schema and logger
export const db = drizzle(pool, {
	schema,
	mode: 'default',
	logger: NODE_ENV === 'development' ? new DatabaseLogger() : false
})

// Export pool for raw queries if needed
export { pool }
