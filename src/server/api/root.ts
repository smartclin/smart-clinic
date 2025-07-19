import { authRouter } from '@/server/api/routers/auth.route'
import {
	createCallerFactory,
	createTRPCContext,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '@/server/api/trpc'

import { adminRouter } from './routers/Admin.router'
import { appointmentRouter } from './routers/Appointment.router'
import { doctorRouter } from './routers/Doctor.router'
import { medicalRecordsRouter } from './routers/MedicalRecords.router'
import { patientRouter } from './routers/Patient.router'
import { paymentRouter } from './routers/Payment.router'
import { staffRouter } from './routers/Staff.router'
import { todoRouter } from './routers/todo'
import { vitalSignsRouter } from './routers/VitalSigns.router'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	auth: authRouter,
	healthCheck: publicProcedure.query(async () => {
		return 'OK'
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: 'This is private',
			user: ctx.session.user,
		}
	}),
	todo: todoRouter,
	vitalSigns: vitalSignsRouter,
	staff: staffRouter,
	payment: paymentRouter,
	patient: patientRouter,
	medicalRecords: medicalRecordsRouter,
	doctor: doctorRouter,
	appointment: appointmentRouter,
	admin: adminRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)

export const createContext = createTRPCContext
