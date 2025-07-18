import z from 'zod'

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc'

const roleSchema = z.enum(['patient', 'doctor', 'admin', 'staff'])

export const authRouter = createTRPCRouter({
	getSession: protectedProcedure.query(async ({ ctx }) => {
		const { session, user } = ctx

		return { session, user }
	}),

	// Get current user role as lowercase string, default to "patient"
	getRole: protectedProcedure.query(({ ctx }) => {
		const role = ctx.user?.role?.toLowerCase() || 'patient'
		return role
	}),

	// Check if current user has a specific role
	checkRole: protectedProcedure.input(roleSchema).query(({ input: role, ctx }) => {
		const userRole = ctx.user?.role?.toLowerCase()
		return userRole === role.toLowerCase()
	}),
	me: protectedProcedure.query(({ ctx }) => {
		return {
			...ctx.user,
			session: {
				id: ctx.session.id,
				ipAddress: ctx.session.ipAddress,
				userAgent: ctx.session.userAgent,
			},
		}
	}),
})
