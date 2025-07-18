// src/trpc/routers/appointment.ts
// This file defines the tRPC procedures related to appointment data.

import { AppointmentStatus } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod' // Zod for input validation

import { addVitalSigns, appointmentAction, createNewAppointment } from '@/actions/appointment'
import { AppointmentSchema, VitalSignsSchema } from '@/lib/schema'
// Import your existing Prisma-based appointment service functions
import {
	getAppointmentById,
	getAppointmentWithMedicalRecordsById,
	getPatientAppointments,
} from '@/server/services/appointment' // Adjust path if different

// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { createTRPCRouter, protectedProcedure } from '../trpc'

export const appointmentRouter = createTRPCRouter({
	/**
	 * Fetches a single appointment record by its ID.
	 * Input: id (number)
	 */
	getAppointmentById: protectedProcedure
		.input(z.number()) // Appointment ID
		.query(async ({ input: id }) => {
			try {
				const result = await getAppointmentById(id)
				// The service function already handles not found by throwing, so this is fine.
				return result
			} catch (error) {
				console.error('Error in tRPC appointmentRouter.getAppointmentById:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				// Catch the specific error message from service and provide a more specific TRPCError
				if (error instanceof Error && error.message.includes('Appointment ID does not exist')) {
					throw new TRPCError({ code: 'BAD_REQUEST', message: error.message })
				}
				if (error instanceof Error && error.message.includes('Appointment data not found')) {
					throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch appointment by ID.',
				})
			}
		}),

	/**
	 * Fetches a list of patient appointments with pagination and search capabilities.
	 * Can filter by patientId or doctorId if 'id' is provided.
	 * Input: { page, limit, search, id }
	 */
	getPatientAppointments: protectedProcedure
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
				id: z.string().optional(), // Patient ID or Doctor ID
			}),
		)
		.query(async ({ input }) => {
			try {
				const result = await getPatientAppointments(input)
				return result
			} catch (error) {
				console.error('Error in tRPC appointmentRouter.getPatientAppointments:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch patient appointments.',
				})
			}
		}),

	/**
	 * Fetches a single appointment along with its related medical records (diagnosis, lab tests, vital signs) and bills.
	 * Input: id (number)
	 */
	getAppointmentWithMedicalRecordsById: protectedProcedure
		.input(z.number()) // Appointment ID
		.query(async ({ input: id }) => {
			try {
				const result = await getAppointmentWithMedicalRecordsById(id)
				return result
			} catch (error) {
				console.error(
					'Error in tRPC appointmentRouter.getAppointmentWithMedicalRecordsById:',
					error,
				)
				if (error instanceof TRPCError) {
					throw error
				}
				// Catch specific error messages from service
				if (error instanceof Error && error.message.includes('Appointment ID does not exist')) {
					throw new TRPCError({ code: 'BAD_REQUEST', message: error.message })
				}
				if (error instanceof Error && error.message.includes('Appointment data not found')) {
					throw new TRPCError({ code: 'NOT_FOUND', message: error.message })
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch appointment with medical records.',
				})
			}
		}),
	createNewAppointment: protectedProcedure
		.input(AppointmentSchema) // Use the Zod schema directly for input validation
		.mutation(async ({ input }) => {
			try {
				const result = await createNewAppointment(input)
				return result // Service returns { success, message, appointmentId }
			} catch (error) {
				console.error('Error in tRPC appointmentActionsRouter.createNewAppointment:', error)
				// Translate service errors into tRPC errors
				if (error instanceof TRPCError) {
					throw error
				}
				// If the error message indicates invalid data from Zod, throw a BAD_REQUEST
				if (error instanceof Error && error.message.includes('Invalid data:')) {
					throw new TRPCError({ code: 'BAD_REQUEST', message: error.message })
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create new appointment.',
				})
			}
		}),

	/**
	 * Updates an appointment's status and reason.
	 * Input: { id: number, status: AppointmentStatus, reason: string }
	 * This is a mutation as it updates data.
	 */
	updateAppointmentStatus: protectedProcedure
		.input(
			z.object({
				id: z.number(), // Ensure ID is a number
				status: z.enum(AppointmentStatus), // Use Zod's nativeEnum for Prisma enums
				reason: z.string().optional(), // Reason can be optional based on your UI logic
			}),
		)
		.mutation(async ({ input }) => {
			try {
				const result = await appointmentAction(input.id, input.status, input.reason || '') // Pass reason, default to empty string if optional
				return result
			} catch (error) {
				console.error('Error in tRPC appointmentActionsRouter.updateAppointmentStatus:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to update appointment status.',
				})
			}
		}),

	/**
	 * Adds vital signs to a patient's medical record.
	 * Input: { data: VitalSignsFormData, appointmentId: number, doctorId: string }
	 * This is a mutation as it creates data.
	 */
	addVitalSigns: protectedProcedure
		.input(
			z.object({
				data: VitalSignsSchema, // Zod schema for vital signs form data
				doctorId: z.string(), // Doctor ID as string
				appointmentId: z.number(), // Appointment ID as number
			}),
		)
		.mutation(async ({ input }) => {
			try {
				// Use input.appointmentId (missing 'input.' previously)
				const result = await addVitalSigns(input.data, input.appointmentId, input.doctorId)
				return result
			} catch (error) {
				console.error('Error in tRPC appointmentActionsRouter.addVitalSigns:', error)

				if (error instanceof TRPCError) {
					throw error
				}
				if (error instanceof Error) {
					if (error.message.includes('Unauthorized')) {
						throw new TRPCError({
							code: 'UNAUTHORIZED',
							message: error.message,
						})
					}
					if (error.message.includes('Invalid vital signs data')) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: error.message,
						})
					}
				}

				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to add vital signs.',
				})
			}
		}),
})
