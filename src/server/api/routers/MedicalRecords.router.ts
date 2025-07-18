// src/trpc/routers/medicalRecords.ts
// This file defines the tRPC procedures related to medical records data.

import { TRPCError } from '@trpc/server'
import { z } from 'zod' // Zod for input validation

// Import your existing Prisma-based medical records service function
import { getMedicalRecords } from '@/server/services/medical-record' // Adjust path if different

// Import your tRPC setup (.g., from src/trpc/init.ts)
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const medicalRecordsRouter = createTRPCRouter({
	/**
	 * Fetches medical records with pagination and search capabilities.
	 * Input: { page, limit, search }
	 */
	getMedicalRecords: protectedProcedure
		.input(
			z.object({
				page: z
					.union([z.number(), z.string()])
					.transform(val => (Number(val) <= 0 ? 1 : Number(val))),
				limit: z
					.union([z.number(), z.string()])
					.transform(val => Number(val))
					.optional(),
				search: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			// Use .query() as this is a read operation
			try {
				// Call your existing Prisma-based `getMedicalRecords` service function.
				const result = await getMedicalRecords(input)

				// Return the result received from the service function.
				return result
			} catch (error) {
				console.error('Error in tRPC medicalRecordsRouter.getMedicalRecords procedure:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch medical records.',
				})
			}
		}),
})
