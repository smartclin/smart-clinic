'use server'

// FIX: Add missing type imports for react-query prefetch options
import type {
	FetchInfiniteQueryOptions,
	QueryKey,
	UsePrefetchQueryOptions,
} from '@tanstack/react-query'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
// NOTE: createTRPCOptionsProxy is not the standard way to set up tRPC for RSC.
// The recommended import would be: import { createTRPCProxyClient } from '@trpc/react-query/server';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query' // Keep existing import as per request
import { headers } from 'next/headers'
import { cache } from 'react'

import { type AppRouter, appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'
import { createQueryClient } from '@/trpc/query-client'

/**
 * This wraps the `createTRPCContext` helper and provides the required context
 * for the tRPC API when handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
	// `headers()` is an async function, so `await` is correct here.
	const heads = new Headers(await headers())
	heads.set('x-trpc-source', 'rsc')

	return createTRPCContext({ headers: heads })
})

const getQueryClient = cache(createQueryClient)

// NOTE: Using createTRPCOptionsProxy here is not typical for RSC proxy client.
// The recommended approach involves `createTRPCProxyClient` and passes
// createContext directly. This might not work as expected for direct
// tRPC calls from RSCs for fetching data.
export const trpc = createTRPCOptionsProxy<AppRouter>({
	router: appRouter,
	ctx: createContext, // Pass the context creator function
	queryClient: getQueryClient, // This option might be ignored or used differently by createTRPCOptionsProxy
})

export function HydrateClient({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient()

	return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}

// This function now has its types correctly imported.
export function prefetch(
	queryOptions:
		| UsePrefetchQueryOptions<unknown, Error, unknown, QueryKey>
		| FetchInfiniteQueryOptions<unknown, Error, unknown, QueryKey>,
) {
	const queryClient = getQueryClient()

	// Store the second part of the query key in a variable for clarity and type checking
	const secondKeyPart = queryOptions.queryKey[1]

	// FIX: Explicitly check if secondKeyPart is an object and not null
	// before attempting to use the 'in' operator on it.
	if (
		typeof secondKeyPart === 'object' &&
		secondKeyPart !== null &&
		'infinite' in secondKeyPart &&
		(secondKeyPart as { type?: string }).type === 'infinite' // Assert type for 'type' property
	) {
		void queryClient.prefetchInfiniteQuery(
			queryOptions as FetchInfiniteQueryOptions<unknown, Error, unknown, QueryKey>,
		)
	} else {
		void queryClient.prefetchQuery(
			queryOptions as UsePrefetchQueryOptions<unknown, Error, unknown, QueryKey>,
		)
	}
}
