import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
	/**
	 * Server-side environment variables.
	 * These are **never** exposed to the client.
	 */
	server: {
		NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
		DATABASE_URL: z.string().url({ message: 'Invalid DATABASE_URL format.' }),
		BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET cannot be empty.'),
		BETTER_AUTH_URL: z.string().url({ message: 'Invalid BETTER_AUTH_URL format.' }),
		CORS_ORIGIN: z.string().url({ message: 'Invalid CORS_ORIGIN format.' }),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
		ADMIN_EMAIL: z.string().email().optional(),
		ADMIN_PASSWORD: z.string().min(8).optional(),
		ADMIN_NAME: z.string().optional(),
	},

	/**
	 * Client-side environment variables.
	 * Must be prefixed with NEXT_PUBLIC_ to be exposed.
	 */
	client: {
		NEXT_PUBLIC_APP_URL: z
			.string()
			.url({ message: 'Invalid NEXT_PUBLIC_APP_URL format.' })
			.default('http://localhost:3001'),

		NEXT_PUBLIC_VERCEL_URL: z.string().optional(),

		NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url({
			message: 'Invalid NEXT_PUBLIC_BETTER_AUTH_URL format.',
		}),

		NEXT_PUBLIC_SERVER_URL: z.string().url({
			message: 'Invalid NEXT_PUBLIC_SERVER_URL format.',
		}),
	},

	/**
	 * Provide environment variables here (so they’re available at build/runtime).
	 */
	runtimeEnv: {
		NODE_ENV: process.env.NODE_ENV,
		DATABASE_URL: process.env.DATABASE_URL,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		CORS_ORIGIN: process.env.CORS_ORIGIN,
		ADMIN_EMAIL: process.env.ADMIN_EMAIL,
		ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
		ADMIN_NAME: process.env.ADMIN_NAME,
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
		NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
		NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
		NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
		NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
	},

	/**
	 * Only validate `.env` strictly in production.
	 */
	skipValidation: process.env.NODE_ENV !== 'production',

	/**
	 * Treat empty strings as undefined (safer defaults).
	 */
	emptyStringAsUndefined: true,
})
