// src/trpc/routers/staff.ts
// This file defines the tRPC procedures related to staff.

import { TRPCError } from '@trpc/server'
import { z } from 'zod' // Zod for input validation

import { reviewSchema } from '@/lib/schema'
// Import your existing Prisma-based service function
import { getAllStaff } from '@/server/services/staff' // Adjust path if different

import db from '../../db'
// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const staffRouter = createTRPCRouter({
	getAllStaff: protectedProcedure
		.input(
			z.object({
				// Validate and transform 'page' to a number, ensuring it's at least 1.
				page: z
					.union([z.number(), z.string()])
					.transform(val => (Number(val) <= 0 ? 1 : Number(val))),
				// Validate and transform 'limit' to a number, making it optional.
				limit: z
					.union([z.number(), z.string()])
					.transform(val => Number(val))
					.optional(),
				// 'search' term is an optional string.
				search: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			// Use .query() as this is a read operation
			try {
				// Call your existing Prisma-based `getAllStaff` service function.
				// The input from tRPC is directly compatible with the service function's parameters.
				const result = await getAllStaff(input)

				// Return the result received from the service function.
				// The service function already returns the desired success, data, pagination info, and status.
				return result
			} catch (error) {
				// Log the error for server-side debugging.
				console.error('Error in tRPC staffRouter.getAllStaff procedure:', error)

				// If the caught error is already a TRPCError (e.g., re-thrown from a utility),
				// re-throw it as is.
				if (error instanceof TRPCError) {
					throw error
				}

				// For any other unexpected errors (like the generic Error thrown by the service),
				// throw a generic INTERNAL_SERVER_ERROR to the client.
				// This prevents leaking sensitive error details to the frontend.
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch staff data. Please try again later.',
				})
			}
		}),

	createReview: protectedProcedure
		.input(reviewSchema) // <--- FIX: Use the Zod schema object here
		.mutation(async ({ input }) => {
			// `input` will now be of type `z.infer<typeof reviewSchema>`
			try {
				// `input` is already validated by Zod thanks to .input(reviewSchema)
				// and its type is `ReviewFormValues` (assuming ReviewFormValues is z.infer<typeof reviewSchema>)
				await db.rating.create({ data: input }) // This should work if RatingCreateInput matches ReviewFormValues

				return {
					success: true,
					message: 'Review created successfully',
					status: 200,
				}
			} catch (err) {
				console.error(err)
				return {
					success: false,
					message: 'Internal Server Error',
					status: 500,
				}
			}
		}),
})
