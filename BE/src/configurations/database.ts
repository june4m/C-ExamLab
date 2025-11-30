import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import { DATABASE_URL } from './env'
import * as schema from '../common/database/schema'

// Create MySQL connection pool
const pool = mysql.createPool(DATABASE_URL)

// Initialize Drizzle ORM with schema
export const db = drizzle(pool, { schema, mode: 'default' })

// Export pool for raw queries if needed
export { pool }
