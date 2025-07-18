import { TRPCError } from '@trpc/server'
import z from 'zod'

import db from '../../db'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const todoRouter = createTRPCRouter({
	getAll: publicProcedure.query(async () => {
		return await db.todo.findMany({
			orderBy: {
				id: 'asc',
			},
		})
	}),

	create: publicProcedure
		.input(z.object({ text: z.string().min(1) }))
		.mutation(async ({ input }) => {
			return await db.todo.create({
				data: {
					text: input.text,
				},
			})
		}),

	toggle: publicProcedure
		.input(z.object({ id: z.number(), completed: z.boolean() }))
		.mutation(async ({ input }) => {
			try {
				return await db.todo.update({
					where: { id: input.id },
					data: { completed: input.completed },
				})
			} catch (_error) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Todo not found',
				})
			}
		}),

	delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
		try {
			return await db.todo.delete({
				where: { id: input.id },
			})
		} catch (_error) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Todo not found',
			})
		}
	}),
})
