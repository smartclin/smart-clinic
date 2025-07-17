'use client'

import { type QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpBatchStreamLink, loggerLink } from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query' // Import createTRPCReact
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import SuperJSON from 'superjson'

import type { AppRouter } from '@/server/api/root' // Ensure this path is correct
import { createQueryClient } from '@/trpc/query-client' // Ensure this path is correct

// Get the base URL for tRPC API calls
const getBaseUrl = () => {
	if (typeof window !== 'undefined') return window.location.origin
	// This should ideally be your VERCEL_URL or similar in production for SSR
	return `http://localhost:${process.env.PORT ?? 3000}`
}

// Singleton pattern for the QueryClient in the browser
let clientQueryClientSingleton: QueryClient | undefined
const getQueryClient = () => {
	if (typeof window === 'undefined') {
		// Server: always make a new query client for each request
		return createQueryClient()
	}
	// Browser: use singleton pattern to keep the same query client across renders
	clientQueryClientSingleton ??= createQueryClient()
	return clientQueryClientSingleton
}

// FIX: This is the main tRPC React client instance
// It's usually named 'api' or 'trpc'
export const api = createTRPCReact<AppRouter>()
export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>()

// FIX: The TRPCReactProvider component
export function TRPCReactProvider(props: Readonly<{ children: React.ReactNode }>) {
	const queryClient = getQueryClient() // Get the singleton/new QueryClient

	// Use useState to create a stable tRPC client instance
	const [trpcClient] = useState(() =>
		api.createClient({
			// Use the 'api' instance created above
			links: [
				loggerLink({
					enabled: op =>
						process.env.NODE_ENV === 'development' ||
						(op.direction === 'down' && op.result instanceof Error),
				}),
				httpBatchStreamLink({
					transformer: SuperJSON,
					url: `${getBaseUrl()}/api/trpc`,
					headers: () => {
						const headers = new Headers()
						headers.set('x-trpc-source', 'nextjs-react')
						return headers
					},
				}),
			],
		}),
	)

	return (
		<QueryClientProvider client={queryClient}>
			{/* FIX: Use the Provider component from the api instance */}
			<api.Provider
				client={trpcClient}
				queryClient={queryClient}
			>
				{props.children}
			</api.Provider>
		</QueryClientProvider>
	)
}

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>
