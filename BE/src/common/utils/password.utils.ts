import argon2 from 'argon2'

export const passwordUtils = {
	hash: async (password: string): Promise<string> => {
		return argon2.hash(password, {
			type: argon2.argon2id,
			memoryCost: 19456,
			timeCost: 2,
			parallelism: 1
		})
	},

	verify: async (
		hashedPassword: string,
		plainPassword: string
	): Promise<boolean> => {
		try {
			return await argon2.verify(hashedPassword, plainPassword)
		} catch {
			return false
		}
	}
}
