// src/trpc/routers/doctor.ts
// This file defines the tRPC procedures related to doctor data.

import { TRPCError } from '@trpc/server'
import { z } from 'zod' // Zod for input validation

// Import your existing Prisma-based doctor service functions
import {
	getAllDoctors,
	getAvailableDoctors,
	getDoctorById,
	getDoctorDashboardStats,
	getDoctors,
	getRatingById,
} from '@/server/services/doctor' // Adjust path if different

// Import your tRPC setup (e.g., from src/trpc/init.ts)
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc' // Using publicProcedure for some

export const doctorRouter = createTRPCRouter({
	/**
	 * Fetches a list of all doctors.
	 * This is generally public-facing.
	 */
	getDoctors: publicProcedure.query(async () => {
		try {
			const result = await getDoctors()
			return result
		} catch (error) {
			console.error('Error in tRPC doctorRouter.getDoctors:', error)
			if (error instanceof TRPCError) {
				throw error
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch doctors list.',
			})
		}
	}),

	/**
	 * Fetches dashboard statistics specific to the logged-in doctor.
	 * Requires authentication.
	 */
	getDoctorDashboardStats: protectedProcedure.query(async () => {
		try {
			const result = await getDoctorDashboardStats()
			return result
		} catch (error) {
			console.error('Error in tRPC doctorRouter.getDoctorDashboardStats:', error)
			if (error instanceof TRPCError) {
				throw error
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch doctor dashboard statistics.',
			})
		}
	}),

	/**
	 * Fetches a single doctor's detailed information by ID.
	 * Can be public if doctor profiles are viewable without login.
	 */
	getDoctorById: publicProcedure // Or protectedProcedure if doctor profiles are restricted
		.input(z.string()) // Doctor ID
		.query(async ({ input: id }) => {
			try {
				const result = await getDoctorById(id)
				// If the service returns a specific `data` property, return that.
				// If the service throws an error for "not found", it will be caught.
				if (!result.data) {
					// Check if data itself is null from the service
					throw new TRPCError({
						code: 'NOT_FOUND',
						message: 'Doctor not found.',
					})
				}
				return result
			} catch (error) {
				console.error('Error in tRPC doctorRouter.getDoctorById:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch doctor by ID.',
				})
			}
		}),

	/**
	 * Fetches ratings for a specific doctor by ID.
	 * Typically public-facing.
	 */
	getRatingById: publicProcedure
		.input(z.string()) // Doctor ID (which is staffId in ratings table)
		.query(async ({ input: id }) => {
			try {
				const result = await getRatingById(id)
				return result
			} catch (error) {
				console.error('Error in tRPC doctorRouter.getRatingById:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch doctor ratings.',
				})
			}
		}),

	/**
	 * Fetches all doctors with pagination and search capabilities.
	 * Can be public for a directory or protected for admin lists.
	 */
	getAllDoctors: publicProcedure // Or protectedProcedure
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
			try {
				const result = await getAllDoctors(input)
				return result
			} catch (error) {
				console.error('Error in tRPC doctorRouter.getAllDoctors:', error)
				if (error instanceof TRPCError) {
					throw error
				}
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to fetch all doctors.',
				})
			}
		}),

	/**
	 * Fetches a list of doctors available today.
	 * Typically public-facing for scheduling.
	 */
	getAvailableDoctors: publicProcedure.query(async () => {
		try {
			const result = await getAvailableDoctors()
			return result
		} catch (error) {
			console.error('Error in tRPC doctorRouter.getAvailableDoctors:', error)
			if (error instanceof TRPCError) {
				throw error
			}
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Failed to fetch available doctors.',
			})
		}
	}),
})
