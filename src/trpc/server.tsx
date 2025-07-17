'use server'

import type {
	FetchInfiniteQueryOptions,
	QueryKey,
	UsePrefetchQueryOptions,
} from '@tanstack/react-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { headers } from 'next/headers'
import { cache } from 'react'

import { type AppRouter, appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { createQueryClient } from '@/trpc/query-client'

/**
 * Caches and creates the tRPC context for server usage.
 */
const createContext = cache(async () => {
	const heads = new Headers(await headers())
	heads.set('x-trpc-source', 'rsc')

	return createTRPCContext({ headers: heads })
})
export async function serverClient() {
	const ctx = await createContext()
	return appRouter.createCaller(ctx)
}
/**
 * Cached query client instance for SSR hydration + prefetching.
 */
const getQueryClient = cache(createQueryClient)

/**
 * Server-side tRPC proxy client with cached context and query client.
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
	router: appRouter,
	ctx: createContext,
	queryClient: getQueryClient,
})

/**
 * Wraps React children with TanStack HydrationBoundary for SSR.
 */
export function HydrateClient({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()
	return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}

/**
 * Server-compatible prefetch helper for tRPC queries.
 */
export function prefetch(
	queryOptions:
		| UsePrefetchQueryOptions<unknown, Error, unknown, QueryKey>
		| FetchInfiniteQueryOptions<unknown, Error, unknown, QueryKey>,
) {
	const queryClient = getQueryClient()

	// Assumes your query keys are like ['routeName', { type: 'infinite' }]
	const secondKey = queryOptions.queryKey[1]
	const isInfinite =
		typeof secondKey === 'object' &&
		secondKey !== null &&
		'type' in secondKey &&
		(secondKey as string).type === 'infinite'

	if (isInfinite) {
		void queryClient.prefetchInfiniteQuery(
			queryOptions as FetchInfiniteQueryOptions<unknown, Error, unknown, QueryKey>,
		)
	} else {
		void queryClient.prefetchQuery(
			queryOptions as UsePrefetchQueryOptions<unknown, Error, unknown, QueryKey>,
		)
	}
}
