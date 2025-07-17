import 'server-only'

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { headers } from 'next/headers'
import { cache } from 'react'

import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { makeQueryClient } from '@/trpc/query-client'

// 1. Zero-arg async context getter (RSC-safe)
export const createContext = cache(async () => {
	const heads = await headers()
	return createTRPCContext({ headers: heads })
})

// 2. Memoized QueryClient factory
export const getQueryClient = cache(makeQueryClient)

// 3. RSC-friendly tRPC client proxy
export const trpc = createTRPCOptionsProxy({
	router: appRouter,
	ctx: createContext,
	queryClient: getQueryClient,
})

// 4. Direct server-side caller (for use in RSCs or route handlers)
export const caller = cache(async () => {
	const ctx = await createContext()
	return appRouter.createCaller(ctx)
})
