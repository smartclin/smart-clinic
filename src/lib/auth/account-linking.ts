import type { GenericEndpointContext, Account as HookAccountRecord } from 'better-auth'
import { APIError } from 'better-auth/api'

import { db } from '@/server/db' // Your Prisma client instance import

export const createProviderHandler = async (
	account: HookAccountRecord,
	ctx: GenericEndpointContext | undefined,
) => {
	if (!account.accessToken || !account.refreshToken) {
		throw new APIError('INTERNAL_SERVER_ERROR', {
			message: 'Access token or refresh token is not set',
		})
	}

	const provider = ctx?.context.socialProviders.find(p => p.id === account.providerId)

	if (!provider) {
		throw new APIError('INTERNAL_SERVER_ERROR', {
			message: `Provider account provider is ${account.providerId} but it is not configured`,
		})
	}

	const profile = await provider.getUserInfo({
		accessToken: account.accessToken,
		refreshToken: account.refreshToken,
		scopes: account.scope?.split(',') ?? [],
		idToken: account.idToken ?? undefined,
	})

	if (!profile?.user) {
		throw new APIError('INTERNAL_SERVER_ERROR', {
			message: 'User info is not available',
		})
	}

	await db.$transaction(async tx => {
		// Update the account
		await tx.account.update({
			where: { id: account.id },
			data: {
				name: profile.user.name,
				email: profile.user.email ?? undefined,
				image: profile.user.image,
			},
		})

		// Fetch the user to check defaultAccountId
		const userRecord = await tx.user.findUnique({
			where: { id: account.userId },
			select: { defaultAccountId: true },
		})

		if (userRecord?.defaultAccountId) {
			return
		}

		// Set defaultAccountId if not set
		await tx.user.update({
			where: { id: account.userId },
			data: { defaultAccountId: account.id },
		})
	})
}
