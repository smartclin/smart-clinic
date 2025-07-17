// src/trpc/routers/admin.ts
// This file defines the tRPC procedures related to admin dashboard and services.

import { TRPCError } from '@trpc/server'
import z from 'zod'

import { addNewService, createNewDoctor, createNewStaff } from '@/actions/admin'
import { deleteDataById } from '@/actions/general'
import { DoctorAuthSchema, ServicesSchema, StaffSchema, WorkingDaysSchema } from '@/lib/schema'
// Import your existing Prisma-based admin service functions
import { getAdminDashboardStats, getServices } from '@/server/services/admin' // Adjust path if different

// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { adminProcedure, createTRPCRouter, protectedProcedure } from '../trpc'

export const adminRouter = createTRPCRouter({
	/**
	 * Fetches dashboard statistics for the admin panel.
	 * Requires authentication (admin role typically).
	 */
	getAdminDashboardStats: protectedProcedure.query(async () => {
		try {
			const result = await getAdminDashboardStats()
			return result
		} catch (error) {
			console.error('Error in tRPC adminRouter.getAdminDashboardStats:', error)
			if (error instanceof TRPCError) {
				throw error
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch admin dashboard statistics.',
			})
		}
	}),

	/**
	 * Fetches a list of all services offered by the clinic.
	 * Can be public or protected depending on your app's requirements.
	 */
	getServices: protectedProcedure // Assuming services list is protected
		.query(async () => {
			try {
				const result = await getServices()
				return result
			} catch (error) {
				console.error('Error in tRPC adminRouter.getServices:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				// Catch specific error message from service
				if (error instanceof Error && error.message.includes('Service data not found')) {
					throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch services.',
				})
			}
		}),
	createStaff: adminProcedure.input(StaffSchema).mutation(async ({ input }) => {
		return await createNewStaff(input) // ✅ input is type-checked
	}),

	createDoctor: adminProcedure
		.input(
			DoctorAuthSchema.extend({
				workSchedule: z.array(WorkingDaysSchema),
			}),
		)
		.mutation(async ({ input }) => {
			// Destructure workSchedule from input because createNewDoctor expects it separately
			const { workSchedule, ...doctorData } = input
			return await createNewDoctor({ ...doctorData, workSchedule })
		}),

	addService: adminProcedure.input(ServicesSchema).mutation(async ({ input }) => {
		return await addNewService(input)
	}),

	deleteDataById: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				deleteType: z.enum(['doctor', 'staff', 'patient', 'payment', 'bill']),
			}),
		)
		.mutation(async ({ input }) => {
			return await deleteDataById(input.id, input.deleteType)
		}),
})
