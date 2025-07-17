// lib/auth-role.ts

import { getSession } from '@/lib/auth' // your BetterAuth instance
// This ensures that only valid role strings are used.
export type UserRoles = 'ADMIN' | 'PATIENT' | 'STAFF' | 'DOCTOR'

export const checkRole = async (role: UserRoles) => {
	const session = await getSession()

	return session?.user?.role?.toLowerCase() === role.toLowerCase()
}

export const getRole = async (): Promise<UserRoles> => {
	const session = await getSession()

	const role = (session?.user?.role?.toLowerCase() as UserRoles) ?? 'patient'

	return role
}
export const getUser = async () => {
	const session = await getSession()

	return session?.user ?? null
}
export const getUserId = async () => {
	const session = await getSession()

	return session?.user?.id ?? null
}
export const getUserEmail = async () => {
	const session = await getSession()

	return session?.user?.email ?? null
}
export const getUserName = async () => {
	const session = await getSession()

	return session?.user?.name ?? null
}
export const getUserRole = async () => {
	const session = await getSession()

	return session?.user?.role ?? null
}
