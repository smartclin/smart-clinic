// src/trpc/routers/payment.ts
// This file defines the tRPC procedures related to payments.

import { TRPCError } from '@trpc/server'
import { z } from 'zod' // Zod for input validation

// Import your server actions
import { addDiagnosis, addNewBill, generateBill } from '@/actions/medical'
// FIX 1: Import the actual Zod schema objects, not just types.
// Assuming these schemas are defined in '@/lib/helper' and are Zod objects.
import {
	AddNewBillInputSchema, // This is the schema defined in your actions/medical.ts
	DiagnosisSchema, // Assuming AddDiagnosisInput is z.infer<typeof DiagnosisSchema>
	PaymentSchema, // Assuming GenerateBillInput is z.infer<typeof PaymentSchema>
} from '@/lib/schema' // <--- Adjust this path if your schemas are elsewhere, e.g., '@/lib/helper'
// Import your existing Prisma-based service function
import { getPaymentRecords } from '@/server/services/payments' // Adjust path if different

// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const paymentRouter = createTRPCRouter({
	getPaymentRecords: protectedProcedure
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
			try {
				const result = await getPaymentRecords(input)
				return result
			} catch (error) {
				console.error('Error in tRPC paymentRouter.getPaymentRecords procedure:', error)
				if (error instanceof TRPCError) {
					throw error
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch payment records. Please try again later.',
				})
			}
		}),

	// FIX 2: Correctly handle input for addDiagnosis
	addDiagnosis: protectedProcedure
		// The input schema for tRPC should match the data structure expected by the action.
		// Your `addDiagnosis` action expects `data: DiagnosisFormData` and `appointmentId: string`.
		// So, the tRPC input schema should combine these.
		.input(
			DiagnosisSchema.extend({
				// Extend the base DiagnosisSchema
				appointmentId: z.union([z.string(), z.number()]).transform(String), // Ensure it's a string for the action
			}),
		)
		.mutation(async ({ input }) => {
			// Destructure `appointmentId` and the rest of the data
			const { appointmentId, ...diagnosisData } = input

			// Call your action function with the correct arguments
			return addDiagnosis(diagnosisData, appointmentId)
		}),

	// FIX 3: Use the actual Zod schema object for addNewBill
	addNewBill: protectedProcedure
		.input(AddNewBillInputSchema) // <--- Use the Zod schema object
		.mutation(async ({ input }) => {
			// `input` is already validated and typed as z.infer<typeof AddNewBillInputSchema>
			return addNewBill(input)
		}),

	// FIX 4: Use the actual Zod schema object for generateBill
	generateBill: protectedProcedure
		.input(PaymentSchema) // <--- FIX: Use the actual Zod schema object here
		.mutation(async ({ input }) => {
			// `input` is now correctly validated by tRPC and typed as z.infer<typeof PaymentSchema>
			// Pass this validated data directly to your generateBill action
			return generateBill(input)
		}),
})
