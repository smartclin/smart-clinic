import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import type { auth } from '@/lib/auth'

import { ac, allRoles } from './roles'

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
	plugins: [
		adminClient({
			ac,
			roles: allRoles,
		}),
		inferAdditionalFields<typeof auth>(),
	],
})

export const {
	signIn,
	signOut,
	signUp,
	updateUser,
	changePassword,
	changeEmail,
	deleteUser,
	useSession,
	revokeSession,
	getSession,
	resetPassword,
	linkSocial,
	forgetPassword,
	listAccounts,
	listSessions,
	revokeOtherSessions,
	revokeSessions,
} = authClient

export function useUser() {
	const session = useSession()
	return session.data?.user
}

export function useRole() {
	const session = useSession()
	return session.data?.user?.role
}

export function useIsAdmin() {
	const role = useRole()
	return role === 'admin'
}
export const signInWithGithub = async () => {
	try {
		const data = await signIn.social({
			provider: 'github',
		})
		return data
	} catch (error) {
		console.error('GitHub sign-in error:', error)
		throw error
	}
}
