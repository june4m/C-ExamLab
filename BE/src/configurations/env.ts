import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(__dirname, '../../.env') })

function getEnvVar(key: string): string {
	const value = process.env[key]
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`)
	}
	return value
}

function getEnvVarOptional(key: string, defaultValue: string): string {
	return process.env[key] || defaultValue
}

export const DB_HOST = getEnvVar('DB_HOST')
export const DB_PORT = getEnvVar('DB_PORT')
export const DB_USER = getEnvVar('DB_USER')
export const DB_PASSWORD = getEnvVar('DB_PASSWORD')
export const DB_NAME = getEnvVar('DB_NAME')
export const DATABASE_URL = getEnvVar('DATABASE_URL')
export const NODE_ENV = getEnvVarOptional('NODE_ENV', 'development')
// JWT config
export const JWT_SECRET = getEnvVarOptional(
	'JWT_SECRET',
	'your-secret-key-change-in-production'
)
export const JWT_EXPIRES_IN = getEnvVarOptional('JWT_EXPIRES_IN', '7d')

// SMTP config
export const SMTP_HOST = getEnvVarOptional('SMTP_HOST', '')
export const SMTP_PORT = getEnvVarOptional('SMTP_PORT', '587')
export const SMTP_USER = getEnvVarOptional('SMTP_USER', '')
export const SMTP_PASS = getEnvVarOptional('SMTP_PASS', '')
export const SMTP_FROM = getEnvVarOptional('SMTP_FROM', 'ExamLab <noreply@examlab.com>')
