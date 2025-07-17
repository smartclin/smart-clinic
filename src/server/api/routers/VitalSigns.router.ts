// src/trpc/routers/vitalSigns.ts
// This file defines the tRPC procedures related to vital signs data.

import { TRPCError } from '@trpc/server'
import { z } from 'zod' // Zod for input validation

// Import your existing Prisma-based vital signs service function
import { getVitalSignData } from '@/server/services/medical' // Adjust path if different

// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const vitalSignsRouter = createTRPCRouter({
	/**
	 * Fetches vital sign data for a specific patient over the last 7 days.
	 * Input: patientId (string)
	 */
	getVitalSignData: protectedProcedure
		.input(z.string()) // Patient ID
		.query(async ({ input: id }) => {
			// Use .query() as this is a read operation
			try {
				// Call your existing Prisma-based `getVitalSignData` service function.
				// The input from tRPC is directly compatible with the service function's parameters.
				const result = await getVitalSignData(id)

				// Return the result received from the service function.
				// This function returns an object with data, averages, etc.
				return result
			} catch (error) {
				// Log the error for server-side debugging.
				console.error('Error in tRPC vitalSignsRouter.getVitalSignData procedure:', error)

				// If the caught error is already a TRPCError (e.g., re-thrown from a utility),
				// re-throw it as is.
				if (error instanceof TRPCError) {
					throw error
				}

				// For any other unexpected errors, throw a generic INTERNAL_SERVER_ERROR.
				// This prevents leaking sensitive error details to the frontend.
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch vital sign data. Please try again later.',
				})
			}
		}),
})
