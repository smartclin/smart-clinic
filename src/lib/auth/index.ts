import type { Account as AccountTable } from '@prisma/client'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { admin } from 'better-auth/plugins'
import { headers } from 'next/headers'
import { cache } from 'react'

import { env } from '@/env'
import db from '@/server/db' // Prisma client

import { createProviderHandler } from './account-linking'
import { ac, allRoles } from './roles'

export const GOOGLE_OAUTH_SCOPES = [
	'email',
	'profile',
	'openid',
	'https://www.googleapis.com/auth/calendar',
]

export const auth = betterAuth({
	database: prismaAdapter(db, {
		provider: 'postgresql', // Or 'mysql' if you're using MySQL
	}),

	trustedOrigins: [env.CORS_ORIGIN],

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},

	user: {
		additionalFields: {
			role: { type: 'string', input: false },
			firstName: { type: 'string', required: false },
			lastName: { type: 'string', required: false },
			defaultAccountId: { type: 'string', required: false, input: false },
			defaultCalendarId: { type: 'string', required: false, input: false },
		},

		changeEmail: {
			enabled: true,
			requireVerification: false,
		},

		deleteUser: {
			enabled: true,
			deleteSessions: true,
		},
	},

	account: {
		accountLinking: {
			enabled: true,
			allowDifferentEmails: true,
			trustedProviders: ['google', 'microsoft'],
		},
	},

	databaseHooks: {
		account: {
			create: {
				after: createProviderHandler, // run after account creation
			},
		},
	},

	socialProviders: {
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			accessType: 'offline',
			prompt: 'consent',
			overrideUserInfoOnSignIn: true,
		},
	},

	rateLimit: {
		enabled: true,
		storage: 'database',
	},

	appName: 'Smart Clinic App',

	plugins: [admin({ ac, roles: allRoles }), nextCookies()],
})

// ✅ Memoized session retrieval for server components and layouts
export const getSession = cache(async () => {
	return await auth.api.getSession({
		headers: await headers(),
	})
})

export type Session = typeof auth.$Infer.Session
export type User = Session['user']
export type Account = AccountTable
export type Role = User['role']

const authServer = auth.api

export default authServer // 👈 this line is REQUIRED for CLI to find it
