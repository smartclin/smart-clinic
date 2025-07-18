import 'server-only'

import { type Account, auth, type User } from '@/lib/auth'

import { db } from '../db'

async function withAccessToken(account: Account, headers: Headers) {
	const { accessToken } = await auth.api.getAccessToken({
		body: {
			providerId: account.providerId,
			accountId: account.id,
			userId: account.userId,
		},
		headers,
	})

	return {
		...account,
		accessToken: accessToken ?? account.accessToken,
	}
}

export async function getDefaultAccount(user: User, headers: Headers) {
	const defaultAccountId = user.defaultAccountId

	if (defaultAccountId) {
		const defaultAccount = await db.account.findFirst({
			where: {
				userId: user.id,
				id: defaultAccountId,
			},
		})

		if (defaultAccount) {
			return withAccessToken(defaultAccount, headers)
		}
	}

	const account = await db.$transaction(async tx => {
		const account = await tx.account.findFirst({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' },
		})

		if (account) {
			await tx.user.update({
				where: { id: user.id },
				data: { defaultAccountId: account.id },
			})
		}

		return account
	})

	if (!account) throw new Error('No account found for user')

	return withAccessToken(account, headers)
}

export async function getAccounts(user: User, headers: Headers) {
	const accounts = await db.account.findMany({
		where: { userId: user.id },
	})

	return Promise.all(accounts.map(account => withAccessToken(account, headers)))
}
