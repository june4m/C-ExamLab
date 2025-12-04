import { jwt } from '@elysiajs/jwt'
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../configurations/env'
import { JwtPayload } from '../dtos/jwt.payload'

// Khởi tạo JWT instance
const jwtInstance = jwt({
	name: 'jwt',
	secret: JWT_SECRET,
	exp: JWT_EXPIRES_IN
})

export const jwtUtils = {
	async signAccessToken(payload: JwtPayload): Promise<string> {
		return await jwtInstance.decorator.jwt.sign({ ...payload })
	},
	async verifyToken(token: string): Promise<JwtPayload | null> {
		try {
			const decoded = await jwtInstance.decorator.jwt.verify(token)
			if (
				decoded &&
				typeof decoded === 'object' &&
				'userId' in decoded &&
				'email' in decoded &&
				'isAdmin' in decoded
			) {
				// Ensure isAdmin is a boolean
				const payload: JwtPayload = {
					userId: decoded.userId as string,
					email: decoded.email as string,
					isAdmin:
						decoded.isAdmin === true ||
						decoded.isAdmin === 1 ||
						decoded.isAdmin === 'true'
				}
				return payload
			}
			return null
		} catch (error) {
			return null
		}
	}
}
