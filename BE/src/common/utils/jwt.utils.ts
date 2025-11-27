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
				return decoded as unknown as JwtPayload
			}
			return null
		} catch (error) {
			return null
		}
	}
}
